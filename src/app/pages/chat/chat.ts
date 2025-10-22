import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// الأنترفيسس
export interface Message {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  sentiment?: string;
}

export interface ChatSession {
  _id: string;
  title: string;
  messages: Message[];
  summary: string;
  userPersonalityInsights: any;
  createdAt: Date;
  updatedAt: Date;
}

// تعريف نوع للـ Knowledge Base
interface KnowledgeBase {
  arabic: {
    greetings: string[];
    farewells: string[];
    thanks: string[];
    questions: {
      what: string[];
      how: string[];
      why: string[];
      when: string[];
      where: string[];
      who: string[];
    };
    emotions: {
      happy: string[];
      sad: string[];
      angry: string[];
      excited: string[];
    };
    topics: {
      technology: string[];
      programming: string[];
      science: string[];
      education: string[];
      health: string[];
    };
    general: string[];
  };
  english: {
    greetings: string[];
    farewells: string[];
    thanks: string[];
    questions: {
      what: string[];
      how: string[];
      why: string[];
      when: string[];
      where: string[];
      who: string[];
    };
    emotions: {
      happy: string[];
      sad: string[];
      angry: string[];
      excited: string[];
    };
    topics: {
      technology: string[];
      programming: string[];
      science: string[];
      education: string[];
      health: string[];
    };
    general: string[];
  };
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  currentSession: ChatSession | null = null;
  chatSessions: ChatSession[] = [];
  newMessage = '';
  isSidebarOpen = true;
  isLoading = false;
  isSending = false;

  // AI Knowledge Base - كل الردود هنا
  private knowledgeBase: KnowledgeBase = {
    arabic: {
      greetings: [
        "أهلاً وسهلاً! 🌟 أنا FBT AI، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟",
        "مرحباً بك! 😊 يومك جميل؟ أنا هنا لأي مساعدة تحتاجها.",
        "السلام عليكم! 🤖 مساعدك AI في الخدمة. أخبرني ما الذي يمكنني فعله لك!",
        "أهلاً! 💫 سعيد بلقائك. كيف حالك اليوم؟",
        "مرحباً! 🎯 أنا هنا لمساعدتك في أي شيء تريده."
      ],

      farewells: [
        "مع السلامة! 🌟 كان حديثاً رائعاً. أتطلع لرؤيتك مجدداً!",
        "إلى اللقاء! 😊 لا تتردد في العودة أي وقت تحتاج مساعدة.",
        "وداعاً! 🤖 كان من الرائع التحدث معك. أراك قريباً!",
        "مع السلامة! 💫 أتمنى لك يوماً رائعاً!",
        "إلى اللقاء! 🎯 لا تنسى أنني هنا دائماً لمساعدتك."
      ],

      thanks: [
        "العفو! 😊 سعيد لأنني استطعت مساعدتك. هل هناك شيء آخر تحتاجه؟",
        "لا شكر على واجب! 🌟 أنا هنا دائماً لخدمتك.",
        "من دواعي سروري! 🤖 سعيد لأنني قدمت لك المساعدة.",
        "العفو يا صديقي! 💫 هذا واجبي towards you.",
        "لا تقلق! 🎯 سعيد جداً لأنني استطعت مساعدتك."
      ],

      questions: {
        what: [
          "سؤال ممتاز! 🤔 دعني أفكر في أفضل طريقة للإجابة...",
          "أحب هذا السؤال! 💭 إنه يستحق مناقشة متعمقة.",
          "سؤال مثير للاهتمام! 🧠 من أين تريد أن نبدأ؟",
          "هذا يستحق التفكير! 🌟 ما هو رأيك الشخصي في هذا الأمر؟",
          "سؤال عميق! 💫 دعنا نستكشف هذا الموضوع together."
        ],
        how: [
          "سأشرح لك هذا بالتفصيل! 🚀 هيا نبدأ...",
          "هذا يحتاج إلى شرح متسلسل. 💻 دعني أوضح لك...",
          "سأريك كيف يتم هذا خطوة بخطوة! 📚",
          "هذا سهل! 😊 دعني أشرح لك الطريقة...",
          "سأدلك على أفضل طريقة للقيام بذلك! 🌟"
        ],
        why: [
          "هذا سؤال فلسفي رائع! 💭 دعنا نبحث عن الأسباب...",
          "سؤال يحتاج إلى تحليل عميق! 🧠 هناك عدة أسباب...",
          "هذا مثير للتفكير! 🌟 دعني أشاركك وجهة نظري...",
          "سؤال مهم! 💫 إليك الأسباب الرئيسية...",
          "دعنا نستكشف الأسباب معاً! 🎯"
        ],
        when: [
          "حسناً، دعني أخبرك عن التوقيت المناسب! ⏰",
          "هذا يعتمد على عدة عوامل! 📅 سأشرح لك...",
          "التوقيت مهم جداً! 🌟 إليك ما تحتاج معرفته...",
          "دعني أوضح لك أفضل الأوقات لهذا! 💫",
          "هذا سؤال توقيت ممتاز! 🎯 سأخبرك بالتفاصيل..."
        ],
        where: [
          "سأدلك على المكان المناسب! 🗺️",
          "هذا يعتمد على موقعك! 🌍 دعني أساعدك...",
          "هناك عدة أماكن مناسبة! 💫 سأخبرك عنها...",
          "دعني أوضح لك أفضل الأماكن لهذا! 🎯",
          "سأرشدك إلى المكان المثالي! 🌟"
        ],
        who: [
          "سأخبرك عن الأشخاص المعنيين! 👥",
          "هذا يتعلق بعدة أشخاص! 💫 دعني أوضح...",
          "سأقدم لك المعلومات عن المعنيين! 🧠",
          "دعني أخبرك عن الأشخاص المناسبين! 🌟",
          "هذا سؤال عن الهوية! 🎯 سأشرح لك..."
        ]
      },

      emotions: {
        happy: [
          "أنا سعيد لأجلك! 😊 يبدو أنك في حالة معنوية رائعة!",
          "هذا ممتاز! 🌟 الطاقة الإيجابية معدية!",
          "رائع! 💫 أشعر بسعادتك من خلال كلماتك!",
          "أحب حماسك! 🎯 استمر في هذا التفاؤل!",
          "هذا يجعلني سعيداً أيضاً! 🤗 فرحتك تشرق من كلامك!"
        ],
        sad: [
          "أنا هنا من أجلك. 🫂 إذا كنت بحاجة إلى الحديث، فأنا مستمع جيد.",
          "أفهم أنك تشعر بالحزن. 💫 تذكر أن كل شيء مؤقت والأيام الجميلة قادمة.",
          "لا تتردد في مشاركة مشاعرك. 🤗 أنا هنا لدعمك دائماً.",
          "أعلم أن الأمور قد تكون صعبة أحياناً. 🌟 لكنك أقوى مما تظن.",
          "أنا معك في هذا الوقت. 🎯 تحدث معي عما يزعجك."
        ],
        angry: [
          "أفهم أنك تشعر بالإحباط. 😐 خذ نفساً عميقاً، أنا هنا لمساعدتك.",
          "الغضب شعور طبيعي. 💭 دعنا نحاول فهم مصدر هذا الغضب.",
          "أنا هنا لمساعدتك في تخطي هذا الشعور. 🌟 خذ وقتك.",
          "دعنا نبحث عن حل معاً. 🎯 الغضب يمر ولكن الحلول تبقى.",
          "أفهم غضبك. 💫 تحدث معي عما يزعجك بالضبط."
        ],
        excited: [
          "حماسك رائع! 🚀 أتطلع لمعرفة ما يثير حماسك!",
          "هذا ممتع! 🌟 الطاقة الإيجابية تملأ المكان!",
          "أحب حماسك! 💫 أخبرني المزيد عن ما يثير اهتمامك!",
          "هذا الحماس معدي! 🎯 دعنا نستكشف هذا معاً!",
          "رائع! 🤗 حماسك يجعل المحادثة أكثر متعة!"
        ]
      },

      topics: {
        technology: [
          "التكنولوجيا عالم رائع! 💻 أي جانب تقني يهمك تحديداً؟",
          "أحب الحديث عن التكنولوجيا! 🚀 هناك الكثير من الابتكارات المثيرة.",
          "العالم الرقمي يتطور بسرعة! 🤖 ما هو مجال التقنية المفضل لديك؟",
          "التقنية تغير حياتنا! 🌟 أخبرني عن اهتماماتك التقنية.",
          "هذا مجال شيق! 💫 هناك دائمًا شيء جديد لنتعلمه في التكنولوجيا."
        ],
        programming: [
          "البرمجة مهارة رائعة! 💻 أي لغة برمجة تفضل؟",
          "أحب الحديث عن البرمجة! 🚀 هناك دائمًا تقنيات جديدة تظهر.",
          "العالم البرمجي مليء بالإبداع! 🤖 ما هو مشروعك المفضل؟",
          "البرمجة تفتح آفاقاً لا نهائية! 🌟 أخبرني عن تجربتك.",
          "هذا مجال مثير! 💫 البرمجة هي لغة المستقبل."
        ],
        science: [
          "العلم بحر لا نهاية له! 🔬 أي فرع علمي يثير اهتمامك؟",
          "الاكتشافات العلمية مذهلة! 🧪 ما هو الموضوع العلمي المفضل لديك؟",
          "العلم يفسر العالم من حولنا! 🌍 أخبرني عن فضولك العلمي.",
          "هذا مجال معرفي رائع! 💫 هناك دائمًا أسرار جديدة لاكتشافها.",
          "أحب الأسئلة العلمية! 🚀 أي جانب تريد استكشافه؟"
        ],
        education: [
          "التعلم رحلة مستمرة! 📚 أي موضوع تريد تعلمه اليوم؟",
          "المعرفة قوة! 💡 ما هو المجال التعليمي الذي يهمك؟",
          "التعليم يفتح الأبواب! 🎓 أخبرني عن اهتماماتك التعليمية.",
          "أحب مساعدة الناس على التعلم! 🌟 ما الذي تريد معرفته؟",
          "الاستفسار عن التعليم رائع! 💫 أي موضوع تفضل؟"
        ],
        health: [
          "الصحة تاج على رؤوس الأصحاء! 🏥 هل لديك استفسار صحي محدد؟",
          "العناية بالصحة مهمة جداً! 💪 ما هو الجانب الصحي الذي يهمك؟",
          "الصحة الجيدة هي الكنز الحقيقي! 🌟 أخبرني عن استفساراتك الصحية.",
          "أحب الحديث عن مواضيع الصحة! 🍎 ما الذي تريد معرفته؟",
          "الوعي الصحي جميل! 💫 هل لديك سؤال صحي معين؟"
        ]
      },

      general: [
        "أعجبني ما قلته! 💭 هذا يفتح أفاقاً للمناقشة.",
        "مثير للتفكير! 🧠 ما هو رأيك الشخصي في هذا؟",
        "هذا مثير للاهتمام! 🌟 أخبرني المزيد عن وجهة نظرك.",
        "لطيف! 😊 هذا يذكرني بمواضيع شيقة أخرى.",
        "عميق! 💫 كيف توصلت إلى هذا الاستنتاج؟",
        "رائع! 🎯 هذا يستحق المزيد من الاستكشاف.",
        "جميل! 🤗 أحب طريقة تفكيرك في هذا.",
        "ممتع! 🚀 هذا يجعل المحادثة أكثر تشويقاً.",
        "استثنائي! 💡 لديك نظرة ثاقبة للأمور.",
        "فريد! 🌈 هذا يضيف بعداً جديداً للنقاش."
      ]
    },

    english: {
      greetings: [
        "Hello there! 🌟 I'm FBT AI, your intelligent assistant. How can I help you today?",
        "Hi! 😊 Having a good day? I'm here for whatever help you need.",
        "Welcome! 🤖 Your AI assistant at your service. Tell me what I can do for you!",
        "Hey! 💫 Great to see you. How are you doing today?",
        "Hello! 🎯 I'm here to assist you with anything you need."
      ],

      farewells: [
        "Goodbye! 🌟 It was great talking with you. Looking forward to our next chat!",
        "See you later! 😊 Feel free to come back anytime you need assistance.",
        "Farewell! 🤖 It was wonderful conversing with you. Talk to you soon!",
        "Bye for now! 💫 Have an amazing day!",
        "See you! 🎯 Remember, I'm always here to help you."
      ],

      thanks: [
        "You're welcome! 😊 Glad I could help. Is there anything else you need?",
        "My pleasure! 🌟 I'm always here to assist you.",
        "Happy to help! 🤖 Delighted that I could be of assistance.",
        "You're welcome, my friend! 💫 That's what I'm here for.",
        "No problem at all! 🎯 Very happy I could assist you."
      ],

      questions: {
        what: [
          "Excellent question! 🤔 Let me think about the best way to answer...",
          "I love this question! 💭 It deserves a deep discussion.",
          "Interesting question! 🧠 Where should we start?",
          "This is worth thinking about! 🌟 What's your personal take on this?",
          "Profound question! 💫 Let's explore this topic together."
        ],
        how: [
          "I'll explain this in detail! 🚀 Let's get started...",
          "This needs a step-by-step explanation. 💻 Let me clarify...",
          "I'll show you how it's done step by step! 📚",
          "This is easy! 😊 Let me explain the method...",
          "I'll guide you through the best way to do this! 🌟"
        ],
        why: [
          "That's a wonderful philosophical question! 💭 Let's look for the reasons...",
          "A question that needs deep analysis! 🧠 There are several reasons...",
          "This is thought-provoking! 🌟 Let me share my perspective...",
          "Important question! 💫 Here are the main reasons...",
          "Let's explore the reasons together! 🎯"
        ],
        when: [
          "Well, let me tell you about the right timing! ⏰",
          "This depends on several factors! 📅 Let me explain...",
          "Timing is very important! 🌟 Here's what you need to know...",
          "Let me clarify the best times for this! 💫",
          "Excellent timing question! 🎯 I'll give you the details..."
        ],
        where: [
          "I'll guide you to the right place! 🗺️",
          "This depends on your location! 🌍 Let me help you...",
          "There are several suitable places! 💫 I'll tell you about them...",
          "Let me show you the best places for this! 🎯",
          "I'll direct you to the perfect place! 🌟"
        ],
        who: [
          "I'll tell you about the people involved! 👥",
          "This relates to several people! 💫 Let me clarify...",
          "I'll provide information about those involved! 🧠",
          "Let me tell you about the right people! 🌟",
          "This is an identity question! 🎯 Let me explain..."
        ]
      },

      emotions: {
        happy: [
          "I'm happy for you! 😊 You seem to be in a great mood!",
          "That's excellent! 🌟 Positive energy is contagious!",
          "Wonderful! 💫 I can feel your happiness through your words!",
          "I love your enthusiasm! 🎯 Keep up that optimism!",
          "This makes me happy too! 🤗 Your joy shines through your words!"
        ],
        sad: [
          "I'm here for you. 🫂 If you need to talk, I'm a good listener.",
          "I understand you're feeling sad. 💫 Remember that everything is temporary and better days are coming.",
          "Don't hesitate to share your feelings. 🤗 I'm here to support you always.",
          "I know things can be tough sometimes. 🌟 But you're stronger than you think.",
          "I'm with you during this time. 🎯 Talk to me about what's bothering you."
        ],
        angry: [
          "I understand you're feeling frustrated. 😐 Take a deep breath, I'm here to help.",
          "Anger is a natural feeling. 💭 Let's try to understand the source of this anger.",
          "I'm here to help you overcome this feeling. 🌟 Take your time.",
          "Let's look for a solution together. 🎯 Anger passes but solutions remain.",
          "I understand your anger. 💫 Talk to me about what's bothering you exactly."
        ],
        excited: [
          "Your excitement is wonderful! 🚀 I look forward to knowing what excites you!",
          "This is fun! 🌟 Positive energy fills the place!",
          "I love your excitement! 💫 Tell me more about what interests you!",
          "This excitement is contagious! 🎯 Let's explore this together!",
          "Awesome! 🤗 Your excitement makes the conversation more enjoyable!"
        ]
      },

      topics: {
        technology: [
          "Technology is a wonderful world! 💻 Which technical aspect interests you specifically?",
          "I love talking about technology! 🚀 There are so many exciting innovations.",
          "The digital world is evolving rapidly! 🤖 What's your favorite technology field?",
          "Technology is changing our lives! 🌟 Tell me about your technical interests.",
          "This is an interesting field! 💫 There's always something new to learn in technology."
        ],
        programming: [
          "Programming is an amazing skill! 💻 Which programming language do you prefer?",
          "I love talking about programming! 🚀 There are always new technologies emerging.",
          "The programming world is full of creativity! 🤖 What's your favorite project?",
          "Programming opens endless horizons! 🌟 Tell me about your experience.",
          "This is an exciting field! 💫 Programming is the language of the future."
        ],
        science: [
          "Science is an endless ocean! 🔬 Which scientific branch sparks your interest?",
          "Scientific discoveries are amazing! 🧪 What's your favorite scientific topic?",
          "Science explains the world around us! 🌍 Tell me about your scientific curiosity.",
          "This is a wonderful knowledge field! 💫 There are always new secrets to discover.",
          "I love scientific questions! 🚀 Which aspect do you want to explore?"
        ],
        education: [
          "Learning is a continuous journey! 📚 What topic do you want to learn today?",
          "Knowledge is power! 💡 What educational field interests you?",
          "Education opens doors! 🎓 Tell me about your educational interests.",
          "I love helping people learn! 🌟 What do you want to know?",
          "Inquiring about education is great! 💫 What subject do you prefer?"
        ],
        health: [
          "Health is a crown on the heads of the healthy! 🏥 Do you have a specific health inquiry?",
          "Taking care of health is very important! 💪 What health aspect interests you?",
          "Good health is the real treasure! 🌟 Tell me about your health inquiries.",
          "I love talking about health topics! 🍎 What do you want to know?",
          "Health awareness is beautiful! 💫 Do you have a specific health question?"
        ]
      },

      general: [
        "I like what you said! 💭 This opens up avenues for discussion.",
        "Thought-provoking! 🧠 What's your personal take on this?",
        "This is interesting! 🌟 Tell me more about your perspective.",
        "Nice! 😊 This reminds me of other interesting topics.",
        "Deep! 💫 How did you arrive at this conclusion?",
        "Awesome! 🎯 This deserves more exploration.",
        "Beautiful! 🤗 I love your way of thinking about this.",
        "Enjoyable! 🚀 This makes the conversation more exciting.",
        "Exceptional! 💡 You have insightful views on things.",
        "Unique! 🌈 This adds a new dimension to the discussion."
      ]
    }
  };

  // Settings
  showSettingsModal = false;
  settings = {
    language: 'both',
    theme: 'future',
    fontSize: 'medium',
    autoSave: true
  };

  // Quick prompts
  quickPrompts = [
    {
      title: 'Creative Writing',
      prompt: 'Help me write a creative story about artificial intelligence',
      icon: '✍️'
    },
    {
      title: 'Code Help',
      prompt: 'Explain how to build a chat application with Angular',
      icon: '💻'
    },
    {
      title: 'Research',
      prompt: 'Tell me about the latest developments in AI technology',
      icon: '🔍'
    },
    {
      title: 'Translation',
      prompt: 'Translate "Hello, how are you today?" to Arabic',
      icon: '🌐'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loadSettings();
    await this.loadChatSessions();

    if (this.chatSessions.length === 0) {
      this.createNewSession();
    } else {
      this.currentSession = this.chatSessions[0];
    }
  }

  ngAfterViewInit() {
    this.scrollToBottom();
    this.focusInput();
  }

  ngOnDestroy() {}

  // === AI RESPONSE GENERATION ===
  private generateAIResponse(userMessage: string): string {
    const language = this.detectLanguage(userMessage);
    const analysis = this.analyzeMessage(userMessage, language);
    return this.generateSmartResponse(userMessage, language, analysis);
  }

  private detectLanguage(text: string): 'ar' | 'en' {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text) ? 'ar' : 'en';
  }

  private analyzeMessage(text: string, language: 'ar' | 'en') {
    const lowerText = text.toLowerCase();
    const langKey = language === 'ar' ? 'arabic' : 'english';

    return {
      isGreeting: this.isGreeting(lowerText, langKey),
      isFarewell: this.isFarewell(lowerText, langKey),
      isThanks: this.isThanks(lowerText, langKey),
      questionType: this.getQuestionType(lowerText, langKey),
      emotion: this.detectEmotion(lowerText, langKey),
      topic: this.detectTopic(lowerText, langKey)
    };
  }

  private isGreeting(text: string, lang: string): boolean {
    const greetings = {
      arabic: ['مرحبا', 'اهلا', 'السلام', 'اهلاً', 'مساء', 'صباح', 'hello', 'hi', 'hey'],
      english: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'howdy', 'مرحبا', 'اهلا']
    };
    return (greetings as any)[lang].some((greet: string) => text.includes(greet));
  }

  private isFarewell(text: string, lang: string): boolean {
    const farewells = {
      arabic: ['مع السلامة', 'وداعا', 'الى اللقاء', 'bye', 'goodbye', 'see you'],
      english: ['bye', 'goodbye', 'see you', 'farewell', 'مع السلامة', 'وداعا']
    };
    return (farewells as any)[lang].some((farewell: string) => text.includes(farewell));
  }

  private isThanks(text: string, lang: string): boolean {
    const thanks = {
      arabic: ['شكرا', 'شكراً', 'متشكر', 'thanks', 'thank you'],
      english: ['thanks', 'thank you', 'thank', 'شكرا', 'شكراً']
    };
    return (thanks as any)[lang].some((thank: string) => text.includes(thank));
  }

  private getQuestionType(text: string, lang: string): string | null {
    const questionWords = {
      arabic: {
        what: ['ما', 'ماذا'],
        how: ['كيف'],
        why: ['لماذا'],
        when: ['متى'],
        where: ['أين'],
        who: ['من']
      },
      english: {
        what: ['what'],
        how: ['how'],
        why: ['why'],
        when: ['when'],
        where: ['where'],
        who: ['who']
      }
    };

    const words = (questionWords as any)[lang];
    for (const [type, keywords] of Object.entries(words)) {
      if ((keywords as string[]).some((keyword: string) => text.includes(keyword))) {
        return type;
      }
    }
    return null;
  }

  private detectEmotion(text: string, lang: string): string {
    const emotions = {
      arabic: {
        happy: ['سعيد', 'فرح', 'ممتاز', 'رائع', 'جميل', 'شكرا', 'حلو'],
        sad: ['حزين', 'سيء', 'مشكلة', 'خطأ', 'غاضب', 'ملل'],
        angry: ['غاضب', 'منزعج', 'مستاء', 'غضب'],
        excited: ['متحمس', 'مندهش', 'منبهر']
      },
      english: {
        happy: ['happy', 'good', 'great', 'awesome', 'amazing', 'thanks', 'thank', 'love'],
        sad: ['sad', 'bad', 'problem', 'error', 'angry', 'bored', 'hate'],
        angry: ['angry', 'mad', 'frustrated', 'upset'],
        excited: ['excited', 'thrilled', 'amazed']
      }
    };

    const langEmotions = (emotions as any)[lang];
    for (const [emotion, keywords] of Object.entries(langEmotions)) {
      if ((keywords as string[]).some((keyword: string) => text.includes(keyword))) {
        return emotion;
      }
    }
    return 'neutral';
  }

  private detectTopic(text: string, lang: string): string {
    const topics = {
      arabic: {
        technology: ['كمبيوتر', 'برمجة', 'تطبيق', 'موقع', 'أنترنت', 'هاتف', 'ذكاء', 'ai', 'كود'],
        programming: ['برمجة', 'كود', 'برنامج', 'سوفتوير', 'تطوير'],
        science: ['علم', 'بحث', 'اكتشاف', 'نظرية', 'تجربة'],
        education: ['تعلم', 'دراسة', 'مدرسة', 'جامعة', 'كتاب', 'مادة'],
        health: ['صحة', 'علاج', 'دكتور', 'مرض', 'رياضة', 'غذاء']
      },
      english: {
        technology: ['computer', 'programming', 'app', 'website', 'internet', 'phone', 'ai', 'code'],
        programming: ['programming', 'code', 'software', 'development', 'coding'],
        science: ['science', 'research', 'discovery', 'theory', 'experiment'],
        education: ['learn', 'study', 'school', 'university', 'book', 'subject'],
        health: ['health', 'treatment', 'doctor', 'disease', 'exercise', 'diet']
      }
    };

    const langTopics = (topics as any)[lang];
    for (const [topic, keywords] of Object.entries(langTopics)) {
      if ((keywords as string[]).some((keyword: string) => text.includes(keyword))) {
        return topic;
      }
    }
    return 'general';
  }

  private generateSmartResponse(userMessage: string, language: 'ar' | 'en', analysis: any): string {
    const langKey = language === 'ar' ? 'arabic' : 'english';
    const { isGreeting, isFarewell, isThanks, questionType, emotion, topic } = analysis;

    // Handle specific intents first
    if (isGreeting) {
      return this.getRandomResponse(this.knowledgeBase[langKey].greetings);
    }

    if (isFarewell) {
      return this.getRandomResponse(this.knowledgeBase[langKey].farewells);
    }

    if (isThanks) {
      return this.getRandomResponse(this.knowledgeBase[langKey].thanks);
    }

    // Handle questions
    if (questionType && (this.knowledgeBase[langKey].questions as any)[questionType]) {
      return this.getRandomResponse((this.knowledgeBase[langKey].questions as any)[questionType]);
    }

    // Handle emotions
    if (emotion !== 'neutral' && (this.knowledgeBase[langKey].emotions as any)[emotion]) {
      return this.getRandomResponse((this.knowledgeBase[langKey].emotions as any)[emotion]);
    }

    // Handle topics
    if (topic !== 'general' && (this.knowledgeBase[langKey].topics as any)[topic]) {
      return this.getRandomResponse((this.knowledgeBase[langKey].topics as any)[topic]);
    }

    // General conversation
    return this.getRandomResponse(this.knowledgeBase[langKey].general);
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // === CHAT FUNCTIONS ===
  async loadChatSessions() {
    try {
      this.isLoading = true;

      // جلب الـ sessions من localStorage
      const savedSessions = localStorage.getItem('fbt-ai-sessions');
      if (savedSessions) {
        this.chatSessions = JSON.parse(savedSessions);
      }

      console.log('Loaded sessions from localStorage:', this.chatSessions.length);

    } catch (error) {
      console.error('Error loading sessions:', error);
      this.chatSessions = [];
    } finally {
      this.isLoading = false;
    }
  }

  createNewSession() {
    const language = this.detectLanguage(navigator.language);
    const newSession: ChatSession = {
      _id: 'session-' + Date.now(),
      title: 'New Conversation',
      messages: [
        {
          content: language === 'ar'
            ? "أهلاً وسهلاً! 🌟 أنا FBT AI، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟"
            : "Hello there! 🌟 I'm FBT AI, your intelligent assistant. How can I help you today?",
          sender: 'ai',
          timestamp: new Date(),
          sentiment: 'positive'
        }
      ],
      summary: 'New conversation started',
      userPersonalityInsights: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.chatSessions.unshift(newSession);
    this.currentSession = newSession;
    this.saveSessionsToStorage();

    console.log('New session created:', newSession);
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.currentSession || this.isSending) return;

    const userMessage: Message = {
      content: this.newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      sentiment: 'neutral'
    };

    const userMessageText = this.newMessage.trim();
    this.newMessage = '';
    this.isSending = true;

    try {
      // Add user message
      if (!this.currentSession.messages) {
        this.currentSession.messages = [];
      }
      this.currentSession.messages.push(userMessage);

      this.scrollToBottom();

      // Generate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiResponse = this.generateAIResponse(userMessageText);
      const aiMessage: Message = {
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        sentiment: 'positive'
      };

      this.currentSession.messages.push(aiMessage);
      this.scrollToBottom();

      // Update session title based on conversation
      this.updateSessionTitle();

      // Save to localStorage
      this.saveSessionsToStorage();

    } catch (error) {
      console.error('Error in sendMessage:', error);
    } finally {
      this.isSending = false;
      this.focusInput();
    }
  }

  private updateSessionTitle() {
    if (this.currentSession && this.currentSession.messages.length === 3) {
      // Update title after a few messages
      const userMessages = this.currentSession.messages
        .filter(m => m.sender === 'user')
        .map(m => m.content);

      if (userMessages.length > 0) {
        const firstMessage = userMessages[0].substring(0, 30);
        this.currentSession.title = firstMessage + (userMessages[0].length > 30 ? '...' : '');
        this.saveSessionsToStorage();
      }
    }
  }

  private saveSessionsToStorage() {
    try {
      localStorage.setItem('fbt-ai-sessions', JSON.stringify(this.chatSessions));
    } catch (error) {
      console.error('Error saving sessions to storage:', error);
    }
  }

  async sendQuickPrompt(prompt: string) {
    this.newMessage = prompt;
    await this.sendMessage();
  }

  selectSession(session: ChatSession) {
    this.currentSession = session;
    this.scrollToBottom();
    this.focusInput();
  }

  deleteSession(session: ChatSession, event?: Event) {
    if (event) event.stopPropagation();

    if (confirm('Are you sure you want to delete this conversation?')) {
      const index = this.chatSessions.indexOf(session);
      if (index > -1) {
        this.chatSessions.splice(index, 1);

        if (this.currentSession?._id === session._id) {
          if (this.chatSessions.length > 0) {
            this.currentSession = this.chatSessions[0];
          } else {
            this.createNewSession();
          }
        }

        this.saveSessionsToStorage();
      }
    }
  }

  clearCurrentChat() {
    if (this.currentSession && confirm('Are you sure you want to clear this chat?')) {
      this.currentSession.messages = [];
      this.saveSessionsToStorage();
    }
  }

  // === UTILITY FUNCTIONS ===
  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.messagesContainer?.nativeElement) {
          this.messagesContainer.nativeElement.scrollTop =
            this.messagesContainer.nativeElement.scrollHeight;
        }
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }, 100);
  }

  private focusInput(): void {
    setTimeout(() => {
      if (this.messageInput?.nativeElement) {
        this.messageInput.nativeElement.focus();
      }
    }, 100);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSessionPreview(session: ChatSession): string {
    if (!session.messages || session.messages.length === 0) {
      return 'New conversation';
    }

    // Find the last meaningful message
    for (let i = session.messages.length - 1; i >= 0; i--) {
      const message = session.messages[i];
      if (message.content) {
        return message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
      }
    }

    return 'New conversation';
  }

  // Settings functions
  openSettings() {
    this.showSettingsModal = true;
  }

  closeSettings() {
    this.showSettingsModal = false;
    this.saveSettings();
  }

  saveSettings() {
    localStorage.setItem('fbt-ai-settings', JSON.stringify(this.settings));
    this.applySettings();
  }

  loadSettings() {
    const saved = localStorage.getItem('fbt-ai-settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
    this.applySettings();
  }

  applySettings() {
    document.documentElement.setAttribute('data-theme', this.settings.theme);
    document.documentElement.style.fontSize =
      this.settings.fontSize === 'small' ? '14px' :
      this.settings.fontSize === 'large' ? '18px' : '16px';
  }

  get user() {
    return this.authService.currentUser$;
  }
}
