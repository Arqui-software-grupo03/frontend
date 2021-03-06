import { Component, OnInit } from '@angular/core';
import { UsersService } from './users.service';
import { CloudinaryOptions, CloudinaryUploader } from 'ng2-cloudinary';
import * as $ from 'jquery';
import { ActivatedRoute, Router } from '@angular/router';
import { PostsService } from '@app/posts/posts.service';
import { FlashMessagesService } from 'angular2-flash-messages';

declare var jQuery: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  currentUser;
  user;
  fileChoosen;
  uploader: CloudinaryUploader = new CloudinaryUploader(
     new CloudinaryOptions({ cloudName: 'djc5vnrki', uploadPreset: 'oiw15i7w' })
    );

  loading: any;
  postsArray;
  following;
  constructor(private usersService: UsersService, private route: ActivatedRoute,
              private routerNav: Router, private postsService: PostsService,
              private flashMessage: FlashMessagesService) {
    this.route.data.subscribe(
      res => {
        if (res.user) {
          this.user = res.user;
          // console.log(this.user);
        } else {
          if (this.route.snapshot.params['userId']) {
            this.routerNav.navigate(['home']);
          }
        }
    },
    error => {
    });
  }

  async ngOnInit() {
    this.usersService.castUser.subscribe(
      usr => {
        this.currentUser = usr;
        if (!this.route.snapshot.params['userId']) {
          this.user = usr;
        }
        if (+this.route.snapshot.params['userId'] === this.currentUser.id) {
          this.routerNav.navigate(['profile']);
        }
      }
    );
    this.following = this.user.followers.filter(e => e.id === this.currentUser.id).length > 0 ? true : false;
    this.user.url = this.user.url ? this.user.url : 'https://s17.postimg.cc/xcbukrwdr/Hugh_Jackman_f.jpg';
    /* setTimeout(
      () => this.getData(), 50
    ); */
    await this.getUserPosts();
    this.addjQueryTooltip();
  }

   upload() {
    this.loading = true;
    this.uploader.uploadAll();
    this.uploader.onSuccessItem =  (item: any, response: string, status: number, headers: any): any => {
        const res: any = JSON.parse(response);
        this.user.imageUrl = res.secure_url;
        this.usersService.editUser(this.user);
        this.usersService.patchUser(this.user).subscribe(
          user => {
            console.log('succes');
            this.showMessage('Imagen cambiada', 'success');
            this.loading = false;
            this.fileChoosen = false;
          }, error => {
            this.loading = false;
            this.fileChoosen = true;
          }
        );
      };
    this.uploader.onErrorItem = function(fileItem, response, status, headers) {
        this.loading = false;
         console.log('onErrorItem', fileItem, response, status, headers);
      };
   }

  getData() {
    this.user.followers = 10;
    this.user.following = 20;
    this.user.url = 'https://s17.postimg.cc/xcbukrwdr/Hugh_Jackman_f.jpg';
    this.user.username = 'Name';
  }

  addjQueryTooltip() {
    jQuery('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    }).on('click', () => {
      jQuery(jQuery('[data-toggle="tooltip"]')).tooltip('hide');
    });
  }
  changeFile() {
    this.fileChoosen = true;
  }

  async getUserPosts() {
    const posts = await this.postsService.getUserPosts(this.user.id).toPromise().then().catch((err) => console.log(err));
    if (posts) {
      this.postsArray = posts; // posts.filter(post => post.user_id === this.user.id);
    } else {
      this.postsArray = [];
    }
  }

  async followUser() {
    const response = await this.usersService.followUser(this.user.id).toPromise().then().catch(err => console.log(err));
    if (response) {
      this.following = !this.following;
    } else {
      this.showMessage('Ocurrió un error. Intente nuevamente', 'danger');
    }
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
