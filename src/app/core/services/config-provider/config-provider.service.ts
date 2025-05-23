import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { IAppConfig } from "../../../infrastructure/app-config/iapp-config";
import { BehaviorSubject, filter, Observable, shareReplay } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ConfigProviderService
{
    private config = new BehaviorSubject<IAppConfig | null>(null);
    private configFilePath = 'assets/app.config.json';
    private httpClient: HttpClient = inject(HttpClient);
    readonly data$: Observable<IAppConfig | null> = this.config.asObservable()
        .pipe(
            filter((config) => !!config),
            shareReplay(1)
        );

    get appConfig()
    {
        return this.config.getValue();
    }

    fetchConfig(): void
    {
        this.httpClient.get<IAppConfig>(this.configFilePath)
            .subscribe(
                {
                    next: (config) => {
                        this.config.next(config);
                    } ,
                    error: () =>
                    {
                        this.config.next({
                            apiUrlBase: '',
                            register: {
                                BasePath: '',
                                ConfirmEmail: '',
                                ConfirmRegistration: '',
                                Register: ''
                            },
                            login: {
                                BasePath: '',
                                Login: '',
                                RefreshAccess: '',
                                RevokeAccess: ''
                            }
                        })
                    }
                });
    }
}