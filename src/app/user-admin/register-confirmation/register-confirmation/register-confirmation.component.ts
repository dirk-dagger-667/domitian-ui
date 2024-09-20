import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RegLogHeaderWidgetComponent } from '../../wrappers/reg-log-header-widget/reg-log-header-widget.component';
import { Router, RouterLink } from '@angular/router';
import { ROUTER_TOKENS } from 'src/app/shared/constants/routing-constants';
import { InfoSharingService } from 'src/app/shared/utilities/info-sharing/info-sharing.service';
import { Observable, Subscription, throwError } from 'rxjs';
import { UserAdminService } from '../../services/implementations/user-admin.service';
import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { IUserAdminService } from '../../services/contracts/iuser-admin.service';
import { RegConfDto } from '../../models/dtos/reg-conf-dto';

@Component({
  selector: 'app-register-confirmation',
  templateUrl: './register-confirmation.component.html',
  styleUrls: ['./register-confirmation.component.css'],
  standalone: true,
  imports: [RegLogHeaderWidgetComponent, RouterLink, NgIf]
})
export class RegisterConfirmationComponent implements OnInit, OnDestroy
{
  private readonly sessErrKey: string = 'RegConfError';
  private dto: RegConfDto = new RegConfDto();

  private readonly dataSharingService: InfoSharingService = inject(InfoSharingService);
  private readonly userAdminService: IUserAdminService = inject(UserAdminService);
  private readonly router: Router = inject(Router);

  private readonly subs: Subscription[] = [];

  readonly ROUTER_TOKENS = ROUTER_TOKENS;
  error: string = '';

  ngOnInit(): void
  {
    this.subs.push(
      this.dataSharingService.data$.subscribe({
        next: (resp) => this.dto = resp,
        error: (error) => this.handleError(error)
      }
      ));

    // This is created in anticipation for the full 2-Factor authentication
    // this.subs.push(
    //   this.userAdminService.getConfirmRegistration(this.dto.email)
    //     .subscribe({
    //       next: (resp) => { },
    //       error: (error) => this.handleError(error)
    //     }
    //     ));

    let sesErr = sessionStorage.getItem(this.sessErrKey);

    if (sesErr !== null)
    {
      this.error = sesErr;
    }
  }

  onClick(): void
  {
    this.subs.push(this.userAdminService.get(this.dto.callbackUrl)
      .subscribe({
        next: () => this.router.navigate(['../', `${ROUTER_TOKENS.LOGIN}`]),
        error: (error) => this.handleError(error)
      }
      ));
  }

  handleError(err: HttpErrorResponse): Observable<never> 
  {
    sessionStorage.setItem(this.sessErrKey, err.error);
    this.error = err.message;

    return throwError(() => err);
  }

  ngOnDestroy(): void
  {
    sessionStorage.removeItem(this.sessErrKey);

    this.subs.forEach(sub =>
    {
      if (sub !== undefined)
      {
        sub.unsubscribe();
      }
    });
  }
}