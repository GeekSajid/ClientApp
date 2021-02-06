import { Component, OnInit, NgZone } from '@angular/core';
import { first } from 'rxjs/operators';
import { ChatService } from 'src/services/chat.service';
import { Message } from 'src/models/Message';
import { User } from 'src/app/_models';
import { UserService, AuthenticationService } from 'src/app/_services';
import { Guid } from 'guid-typescript';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User;
  users = [];
  txtMessage: string = '';
  uniqueID: string = Guid.create().toString();
  messages = new Array<Message>();
  message = new Message();
  public res: any;
  public resmessage: string;
  //API
  public _chatUrl: string = 'api/chat/userChat';

  //Chat
  public onlineUser: any = [];
  public chatUsername: string = null;
  public chatConnection: string;
  public loggedUsername: string;

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private chatService: ChatService,
    private _ngZone: NgZone,
  ) {
    this.subscribeToEvents();
    this.currentUser = this.authenticationService.currentUserValue;
    var loggedUser = this.authenticationService.currentUserValue;
    this.loggedUsername = loggedUser.email;

  }

  ngOnInit() {
    this.loadAllUsers();
  }

  deleteUser(id: number) {
    this.userService.delete(id)
      .pipe(first())
      .subscribe(() => this.loadAllUsers());
  }
  sendMessage(): void {
    if (this.txtMessage) {
      this.message = new Message();
      this.message.clientuniqueid = Guid.create().toString();
      this.message.type = "sent";
      debugger;
      this.message.sender = this.authenticationService.currentUserValue.email;
      this.message.receiver = this.chatUsername;
      this.message.message = this.txtMessage;
      this.message.date = new Date();
      this.messages.push(this.message);
      this.chatService.sendMessage(this.message);
      this.txtMessage = '';
    }
  }

  chooseUser(user) {
    this.chatUsername = user.userName;
    this.chatLog();
  }

  chatLog() {
    //ChatLog
    debugger;
    var param = { sender: this.loggedUsername, receiver: this.chatUsername };
    var getchatUrl = this._chatUrl + '?param=' + JSON.stringify(param);
    this.chatService.get(getchatUrl)
      .subscribe(
        response => {
          this.res = response;
          if (this.res != null) {
            var chatLog = this.res.resdata;
            this.messages = [];
            if (chatLog.length > 0) {
              for (var i = 0; i < chatLog.length; i++) {
                if (this.loggedUsername === chatLog[i].sender) {
                  chatLog[i].type = "sent";
                }
                else {
                  chatLog[i].type = "received";
                }

                //Push-Data
                this.messages.push(chatLog[i]);
              }
            }
          }
        }, error => {
          console.log(error);
        }
      );
  }

  private subscribeToEvents(): void {

    this.chatService.messageReceived.subscribe((message: Message) => {
      this._ngZone.run(() => {
        this.chatUsername = message.sender;
        this.chatLog();
      });
    });

    this.chatService.updateUserList.subscribe((onlineUser) => {
      this._ngZone.run(() => {
        debugger;
        var users = JSON.parse(onlineUser);;
        this.onlineUser = [];
        for (var key in users) {
          if (users.hasOwnProperty(key)) {
            if (key !== this.loggedUsername) {
              this.onlineUser.push({
                userName: key,
                connection: users[key]
              });
            }
          }
        }
      });
    });
  }
  private loadAllUsers() {
    this.userService.getAll()
      .pipe(first())
      .subscribe(users => this.users = users);
  }
}
