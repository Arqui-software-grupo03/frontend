import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { TopicService } from '@app/topic/topic.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit, OnDestroy {
  topic;
  topicId;
  private ngUnsubscribe = new Subject();
  constructor(private activatedRoute: ActivatedRoute, private topicService: TopicService,
              private flashMessage: FlashMessagesService, private route: ActivatedRoute,
              private routerNav: Router) {
                this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
                  res => {
                    if (!res.topic) {
                      this.routerNav.navigate(['home']);
                    }
                  this.topic = res.topic;
                  this.topicId = this.topic.topicId;
                },
                error => {

                });
              }

  async ngOnInit() {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.unsubscribe();
  }

  showMessage(message: string, type: string) {
    this.flashMessage.show(message, {
      cssClass: `alert-${type}`,
      timeout: 5000,
      showCloseBtn: true,
      closeOnClick: true
    });
  }

}
