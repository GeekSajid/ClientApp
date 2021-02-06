import { EventEmitter, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { Message } from '../models/message';
import { User } from 'src/app/_models';
import { UserService, AuthenticationService } from 'src/app/_services';
import * as signalR from '@aspnet/signalr';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable()
export class ChatService {
  messageReceived = new EventEmitter<Message>();
  updateUserList = new EventEmitter<User[]>();
  connectionEstablished = new EventEmitter<Boolean>();
  currentUser: User;

  private connectionIsEstablished = false;
  private _hubConnection: HubConnection;

  constructor(private authenticationService: AuthenticationService, private _http: HttpClient) {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
    this.currentUser = this.authenticationService.currentUserValue;
  }

  sendMessage(message: Message) {
    this._hubConnection.invoke('SendMessage', message);
  }

  private createConnection() {
      debugger;
    const token = this.authenticationService.currentUserValue.token;
    var user = this.authenticationService.currentUserValue.email;
  let tokenValue = '';
  if (token !== '') {
      tokenValue = '?token=' + token;
  }
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(window.location.href + 'MessageHub' + '?user=' + user)
      .build();
  }

  private startConnection(): void {
    this._hubConnection
      .start()
      .then(() => {
        this.connectionIsEstablished = true;
        console.log('Hub connection started');
        this.connectionEstablished.emit(true);
      })
      .catch(err => {
        console.log('Error while establishing connection, retrying...');
        setTimeout(function () { this.startConnection(); }, 5000);
      });
  }

  private registerOnServerEvents(): void {
    this._hubConnection.on('ReceiveMessage', (data: any) => {
      this.messageReceived.emit(data);
    });
     //Call client methods from hub to update User
    this._hubConnection.on('UpdateUserList', (data: any) => {
      this.updateUserList.emit(data);
  });
  }

  //Get
  get(_getUrl: string){
    var getUrl = environment.apiUrl +"/" + _getUrl;
    return this._http.get(getUrl);
  }
}  
