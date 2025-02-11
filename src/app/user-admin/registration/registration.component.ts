import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { RegLogHeaderWidgetComponent } from '../wrappers/reg-log-header-widget/reg-log-header-widget.component';
import { ValidationService } from '../services/validation.service';
import { ValidatorConstants } from 'src/app/infrastructure/constants/validation-constants';
import { confirmPasswordSameValidator, passwordValidator } from 'src/app/shared/validators/user-credential-validators';
import { UserAdminBase } from '../reg-log-base';
import { UserAdminService } from '../services/user-admin.service';
import { Router, RouterModule } from '@angular/router';
import { ROUTER_TOKENS } from 'src/app/infrastructure/constants/routing-constants';
import { debounceTime } from 'rxjs';
import { InfoSharingService } from 'src/app/core/services/info-sharing/info-sharing.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RegLogHeaderWidgetComponent, RouterModule],
  standalone: true
})
export class RegistrationComponent extends UserAdminBase implements OnInit
{
  private debounceTime: number = 1000;

  private emailCntrl: AbstractControl<any, any> | null = null;
  private pswdCntrl: AbstractControl<any, any> | null = null;
  private cnfrmPswdCntrl: AbstractControl<any, any> | null = null;

  constructor(
    private readonly validationService: ValidationService,
    private readonly userAdminService: UserAdminService,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly dataSharingService: InfoSharingService
  ) { super(); }

  emailErrMsg: string = '';
  pswdErrMsg: string = '';
  cnfrmErrMsg: string = '';

  emailCntrlName: string = ValidatorConstants.emailControlName;
  pswdCntrlName: string = ValidatorConstants.passwordControlName;
  cnfrmPswdCntrlName: string = ValidatorConstants.confirmPasswordControlName;
  pswdFormGrpCntrlName: string = ValidatorConstants.passwrodFormGroupControlName;

  registrationFormGroup: FormGroup = this.formBuilder.group({
    email: [ValidatorConstants.mailPlaceholder, [Validators.required, Validators.email]],
    passwordFormGroup: this.formBuilder.group({
      password: [null, [Validators.required, Validators.maxLength(24), Validators.minLength(8), passwordValidator(ValidatorConstants.passwordRegex)]],
      confirmPassword: [null, [Validators.required]]
    }, { validator: confirmPasswordSameValidator })
  });

  ngOnInit()
  {
    this.emailCntrl = this.registrationFormGroup.get(this.emailCntrlName);

    this.subs.push(this.emailCntrl?.valueChanges
      .pipe(debounceTime(this.debounceTime))
      .subscribe(() =>
        this.emailErrMsg = this.validationService.contCustValErrorToString(this.registrationFormGroup, this.emailCntrlName))!
    );

    this.pswdCntrl = this.registrationFormGroup.get(`${this.pswdFormGrpCntrlName}.${this.pswdCntrlName}`);

    this.subs.push(this.pswdCntrl?.valueChanges
      .pipe(debounceTime(this.debounceTime))
      .subscribe(() =>
        this.pswdErrMsg = this.validationService.contCustValErrorToString(this.registrationFormGroup, this.pswdCntrlName))!
    );

    this.cnfrmPswdCntrl = this.registrationFormGroup.get(`${this.pswdFormGrpCntrlName}.${this.cnfrmPswdCntrlName}`);

    this.subs.push(this.cnfrmPswdCntrl?.valueChanges
      .pipe(debounceTime(this.debounceTime))
      .subscribe(() =>
        this.cnfrmErrMsg = this.validationService.contCustValErrorToString(this.registrationFormGroup, this.cnfrmPswdCntrlName))!
    );
  }

  isControlInvalid(controlName: string): boolean
  {
    let directControlValResult: boolean = this.validationService.isControlInvalid(this.registrationFormGroup, controlName);

    return directControlValResult;
  }

  onSubmit(): void
  {
    let email = this.emailCntrl?.value;
    let pass = this.pswdCntrl?.value;
    let confPass = this.cnfrmPswdCntrl?.value;

    this.subs.push(
      this.userAdminService.register({ Email: email, Password: pass, ConfirmPassword: confPass })
        .subscribe({
          next: (resp) =>
          {
            this.dataSharingService.sentData({ callbackUrl: resp, email: email });
            this.navigateRegister(resp);
          },
          error: (error) =>
          {
            let err = error;
          }
        })
    );
  }

  private navigateRegister(response: any): void
  {
    if (response.dominitianIsNullOrEmpty())
    {
      this.router.navigate(['../', `${ROUTER_TOKENS.LOGIN}`]);
    }
    else 
    {
      this.router.navigate(['../', `${ROUTER_TOKENS.REG_CONFIRMATION}`]);
    }
  }
}
