import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AIResponse {
    content: string;
    sentiment: string;
    confidence: number;
    language: string;
}

@Injectable({
    providedIn: 'root'
})
export class AIService {
    private apiUrl = 'http://localhost:5000/api/ai';

    constructor(private http: HttpClient) {}

    generateResponse(messages: any[]): Observable<AIResponse> {
        return this.http.post<AIResponse>(`${this.apiUrl}/generate`, { messages });
    }

    analyzeSentiment(text: string): Observable<{sentiment: string}> {
        return this.http.post<{sentiment: string}>(`${this.apiUrl}/sentiment`, { text });
    }

    detectLanguage(text: string): Observable<{language: string}> {
        return this.http.post<{language: string}>(`${this.apiUrl}/detect-language`, { text });
    }
}
