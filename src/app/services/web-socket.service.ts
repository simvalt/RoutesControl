import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  constructor(private socket: Socket) {}

  getData$():Observable<any>{
    return new Observable<any>(observer => {
      try{
        this.socket.on('connect',() => {
          console.log("¡Conectado!")
        })
        this.socket.on('push', (data:any) => {
          observer.next(data);
        })
        this.socket.on('disconnect',() => {
          console.log("¡Desconectado!")
          observer.complete()
        })
      }
      catch{
        this.socket.on('error', (e:any) => {
          observer.error(e);
        })
      }
    }

    )

  }

  sendMessage(msg: string) {
    this.socket.emit('data', msg);
  }
}
