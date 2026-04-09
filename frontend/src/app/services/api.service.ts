import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://taskforge-4sa5.onrender.com/api';  #backend url 

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  getTasks(): Observable<any> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}/tasks`, { headers });
  }

  createTask(task: any): Observable<any> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}/tasks`, task, { headers });
  }

  updateTask(id: number, task: any): Observable<any> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.baseUrl}/tasks/${id}`, task, { headers });
  }

  deleteTask(id: number): Observable<any> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.baseUrl}/tasks/${id}`, { headers });
  }
} 
