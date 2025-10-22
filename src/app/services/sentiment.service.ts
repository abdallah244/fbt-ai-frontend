import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SentimentAnalysis {
    sentiment: string;
    confidence: number;
    label: string;
    emotions: Array<{
        label: string;
        score: number;
        normalized: string;
    }>;
    text: string;
}

export interface ConversationMood {
    overall: string;
    confidence: number;
    totalMessages: number;
    breakdown: {
        positive: number;
        negative: number;
        neutral: number;
    };
    recentTrend: string;
    history: Array<{
        timestamp: Date;
        sentiment: string;
        confidence: number;
        content: string;
    }>;
}

@Injectable({
    providedIn: 'root'
})
export class SentimentService {
    private apiUrl = 'http://localhost:5000/api/chat';

    constructor(private http: HttpClient) {}

    analyzeText(text: string, language?: string): Observable<{data: SentimentAnalysis}> {
        return this.http.post<{data: SentimentAnalysis}>(`${this.apiUrl}/analyze-sentiment`, {
            text,
            language
        });
    }

    analyzeConversationMood(sessionId: string): Observable<{data: {sentiment: ConversationMood}}> {
        return this.http.get<{data: {sentiment: ConversationMood}}>(
            `${this.apiUrl}/sessions/${sessionId}/sentiment`
        );
    }
}
