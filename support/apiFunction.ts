import { ENV } from '../config';
import { request } from '@playwright/test';

class ApiFunction {
    private async createContextIssueHTTPRequest(){
        return await request.newContext({
            baseURL : ENV.BASE_URL
        })
    }

    async callPostLogin(path: string, requestBody?: Record<string, any>) {
        const contextHTTP = await this.createContextIssueHTTPRequest();
        const result = await contextHTTP.post(path, {
            data: requestBody ?? {}
        });
        return {
            statusCode : result.status(),
            statusText : result.statusText(),
            body : await result.json(),
            header : await result.headers()
        }
    }
}

export const onGetMetersData = new ApiFunction();