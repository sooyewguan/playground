import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import * as mqtt from "mqtt";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  mqtt_host = "54.89.207.235";
  mqtt_port = "443";

  devices = [];

  mqtt_client = null;
  mqtt_connected = false;
  constructor(public navCtrl: NavController, private alertCtrl: AlertController) {
    this.devices.push({'_id': 1, 'type':'input', 'pub_topic':'playground/switch', 'sub_topic':'playground/switch', 'status':'0', 'icon':'power'});
    this.devices.push({'_id': 2, 'type':'output', 'pub_topic':'playground/led', 'sub_topic':'playground/led',    'status':'0', 'icon':'bulb'});
    this.devices.push({'_id': 3, 'type':'sensor', 'pub_topic':'playground/temp', 'sub_topic':'playground/temp',   'status':'0', 'icon':'thermometer'}); 
  }

  connect() {
    this.mqtt_client = mqtt.connect('ws://' + this.mqtt_host + ':' + this.mqtt_port + '/');

    let _that = this;
    this.mqtt_client.on('connect', function () {
      console.log('connected');

      _that.mqtt_connected = true;

      _that.devices.forEach(element => {
        _that.mqtt_client.subscribe(element.sub_topic);       
      });
    });

    this.mqtt_client.on('message', function (topic, message) {
      _that.devices.forEach(element => {
        if(element.sub_topic == topic) {
          element.status = message.toString();
        }        
      });
		});
  }

  pub (d) {
    let alert = this.alertCtrl.create({
        title: 'Publish',

        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Send',
            handler: data => {
              if (d['type'] == 'sensor') {
                if(data.message) {
                  this.mqtt_client.publish(d['pub_topic'], data.message);
                } else {
                  console.log('invalid data');
                  return false;
                }
              } else {
                if(data) {
                  console.log(data);
                  this.mqtt_client.publish(d['pub_topic'], data.message);
                } else {
                  console.log('invalid data');
                  return false;
                }
              }
            }
          }
        ]
      });

      if(d['type'] == 'sensor') {
        alert.addInput(
          {
            name: 'message',
            placeholder: 'message'
          });
        } else {           
          alert.addInput({
            type: 'radio',
            label: 'ON',
            value: '1'
          });
          
          alert.addInput({
            type: 'radio',
            label: 'OFF',
            value: '0'
          }
        );
      }
      alert.present();
  }

  edit_sub (i) {
    var d = this.devices.findIndex(function(device){
      if(device._id == i) {
        return true;
      }
    });

    var sub = this.devices[d].sub_topic;
    
    let alert = this.alertCtrl.create({
        title: 'Subcribe Topics',
        inputs: [
          {
            name: 'sub',
            placeholder: 'subcribe/topic',
            value: sub
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Save',
            handler: data => {
              if (data.sub) {
                console.log(data.pub, data.sub);
                this.mqtt_client.unsubscribe(sub);
                this.mqtt_client.subscribe(data.sub);
                
                this.devices[d]['sub_topic'] = data.sub;
              } else {
                console.log('invalid data');
                return false;
              }
            }
          }
        ]
      });
      alert.present();
  }

   edit_pub (i) {
    var d = this.devices.findIndex(function(device){
      if(device._id == i) {
        return true;
      }
    });

    var pub = this.devices[d].pub_topic;
    
    let alert = this.alertCtrl.create({
        title: 'Publish Topics',
        inputs: [
          {
            name: 'pub',
            placeholder: 'published/topic',
            value: pub
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Save',
            handler: data => {
              if (data.pub) {
                console.log(data.pub);
                this.devices[d]['pub_topic'] = data.pub;
              } else {
                console.log('invalid data');
                return false;
              }
            }
          }
        ]
      });
      alert.present();
  }

  delete (i) {
    console.log('delete:', i);

    var d = this.devices.findIndex(function(device){
      if(device._id == i) {
        return true;
      }
    });

    this.devices.splice(d, 1);
  }

}
