import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { promise } from 'protractor';
import { resolve4 } from 'dns';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private budget_data_server = "http://localhost:3000/budget";
  public get_data;
  constructor(private http: HttpClient) { }

  public async sendGetRequest(){
    //debugger;
    if (this.get_data == null){
      return new Promise((resolve, reject) =>{
      this.http.get(this.budget_data_server).toPromise()
        .then((res: any) => {
        this.get_data = res;
        this.writeData(this.get_data);
        resolve();
      }); });
  }
  }

public writeData(data){
    this.get_data = data;
}
  public async getData(){
    await this.sendGetRequest();
    console.log(this.get_data);
    return this.get_data;
  }
}
