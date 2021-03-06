import { Component, OnInit, Input, Output } from '@angular/core';
import { PostsService } from '@app/posts/posts.service';
import { UsersService } from '@app/users/users.service';
import { AppService } from '@app/app.component.service';
import { EventEmitter } from '@angular/core';
import { ThreadService } from '../thread/thread.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  loading = true;
  post;
  userPhotoUrl;
  topic;
  sender;
  hour;
  date;
  showThread;
  threadCounter;
  answers;
  daysOfTheWeek;
  monthNames;
  @Input() topicName: string;
  @Input() postId: any;
  // ver que onda cuando no hay input (cuando se hace de un form)
  constructor(private postsService: PostsService, private usersService: UsersService,
            private appService: AppService, private threadService: ThreadService) {
    this.userPhotoUrl = '../../assets/felipe_de_la_fuente.jpg';
    this.showThread = false;
    this.threadCounter = 0;
    this.monthNames = this.appService.monthNames;
    this.daysOfTheWeek = this.appService.daysOfTheWeek;
  }
  async ngOnInit() {
    await this.getPostInfo();
  }
  onShow(event) {
    this.showThread = event;
  }
  async getPostInfo() {
    await this.postsService.getPost(this.postId).toPromise().then(
      post => {
        this.post = post;
      }, error => {
        console.log(`Post ${error}`);
      }
    );
    if (this.post) {
      const user = await this.usersService.getUserById(this.post.user_id).toPromise().then().catch(err => console.log(err));
      await this.getAnswers();
      if (user) {
        this.sender = user;
        this.sender.defaultImageUrl = 'assets/default-user-image.png';
        const d = new Date(this.post.pub_date);
        this.date = `${d.getDate()} ${this.monthNames[d.getMonth()]}`;
        this.hour = `${d.getHours()}:${d.getMinutes()}`;
        // console.log(this.daysOfTheWeek[this.date.getDay()], this.date.getDate(), this.date.getMonth() + 1, date.getUTCFullYear());
      }
    }
    this.loading = false;
  }

  getThreadCounter(threadCounter) {
    this.threadCounter = threadCounter;
  }

  emitNewAnswer(newA) {
    this.answers = [...this.answers, newA];
    this.threadCounter = this.answers.length;
    this.showThread = true;
  }

  getAnswers() {
    this.threadService.getAllAnswers(this.postId).toPromise().then(
      answers => {
        this.answers = answers;
        this.threadCounter = this.answers.length;
      }
    ).catch(err => {
      console.log(`Error al buscar las respuestas: ${err}`);
    });
  }
}
