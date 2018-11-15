import { Injectable } from '@angular/core';
import { throwError, Observable, BehaviorSubject, Observer } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppService } from '@app/app.component.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Socket } from '@app/socket/socket';
import * as socketIo from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private topics = new BehaviorSubject([]);
  castTopics = this.topics.asObservable();
  httpOptions;
  topicsUrl;
  socket: Socket;
  observer: Observer<any>;
  constructor(private appService: AppService, private http: HttpClient) {
    this.httpOptions = appService.getHttpOptionsWithToken();
    // this.topicsUrl = `${appService.url}/topics`;
    this.topicsUrl = `http://localhost:8080/topics`;
  }

  createTopic(title: string, description: string): Observable<any> {
    const body = {
      title: title,
      description: description,
    };
    const url = `${this.topicsUrl}/`;
    return this.http.post(url, body, this.httpOptions).pipe(catchError(this.errorHandler));
  }

  getTopicById(topicId: number) {
    const url = `${this.topicsUrl}/${topicId}/`;
    return this.http.get(url, this.httpOptions);
  }

  getAllTopics(): Observable<any> {
    const url = `${this.topicsUrl}/`;
    return this.http.get(url, this.httpOptions).pipe(catchError(this.errorHandler));
  }

  addPostToTopic(topicId: number, postId: number) {
    const body = {
      'post_id': postId,
      'topic_identifier': topicId
    };
    const url = `${this.topicsUrl}/${topicId}/post_ids/`;
    return this.http.post(url, body, this.httpOptions).pipe(catchError(this.errorHandler));
  }

  deletePostfromTopic(topicId: number, postId: number) {
    const url = `${this.topicsUrl}/${topicId}/post/${postId}/`;
    return this.http.delete(url, this.httpOptions).pipe(catchError(this.errorHandler));
  }

  getAllPostsFromTopicById(topicId: number) {
    const url = `${this.topicsUrl}/${topicId}/post_ids/`;
    return this.http.get(url, this.httpOptions).pipe(catchError(this.errorHandler));
  }

  subscribeUserToTopic(topicId: number, userId: number) {
    const url = `${this.topicsUrl}/${topicId}/subscribers/`;
    const body = {
      user_id: userId,
      topic: topicId
    };
    return this.http.post(url, body, this.httpOptions).pipe(catchError(this.errorHandler));
  }

  unsubscribeUserToTopic(topicId: number, userId: number) {
    const url = `${this.topicsUrl}/${topicId}/subscribers/${userId}/`;
    return this.http.delete(url, this.httpOptions).pipe(catchError(this.errorHandler));
  }

  getAllSubscribersFromTopic(topicId) {
    const url = `${this.topicsUrl}/${topicId}/subscribers/`;
    return this.http.get(url, this.httpOptions).pipe(catchError(this.errorHandler));
  }


  errorHandler(error: HttpErrorResponse) {
    return throwError(error.status  || 'Server Error');
  }

  addTopicToCastTopics(topic: any) {
    const t = this.topics.value;
    t.push(topic);
    this.topics.next(t);
  }

  updateArrayCastTopics(topicArray: any) {
    this.topics.next(topicArray);
  }

  getAllTopicsFromCastValue() {
    return this.topics.value;
  }

  getFromSocket() {

    this.socket = socketIo('http://localhost:8009');

    this.socket.on('data', (res) => {
      this.observer.next(res.data);
    });

    return this.createObservable();
  }

  createObservable(): Observable<number> {
      return new Observable<number>(observer => {
        this.observer = observer;
      });
  }
}
