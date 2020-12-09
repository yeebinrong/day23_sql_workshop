import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http:HttpClient) { }
  
  async postData (json) {
    console.info("posting")
    const formParams = Object.keys(json).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
    }).join('&');
    
    const headers = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
    console.info(await this.http.post('http://localhost:3000/api/data', formParams, {headers}).toPromise())
  }
}
