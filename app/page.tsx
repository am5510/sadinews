'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Menu, ChevronRight, Play, CheckCircle, Clock, Video, Activity, Settings, Plus, Trash2, X, Image as ImageIcon, Copy, Facebook, Bell, Calendar, LayoutDashboard, BookOpen, ListFilter, FileText, Home, User, UploadCloud, Loader2, Images, Lock, LogOut, Edit, Film, Link as LinkIcon, Code, ArrowLeft } from 'lucide-react';

// TypeScript interfaces
interface NewsItem {
  id: string;
  title: string;
  category: string;
  image: string;
  album?: string[];
  time: string;
  content?: string;
  views?: string;
  date?: string;
  tagColor?: string;
  createdAt?: string;
}

interface TrainingItem {
  id: string | number;
  title: string;
  date: number;
  month: number;
  year: number;
  time: string;
  location: string;
  seats: number;
  available: number;
  price?: string;
  type: string;
  speaker?: string;
  speakerImage?: string;
  description?: string;
}

interface MediaItem {
  id: string;
  title: string;
  category: string;
  sourceType: string;
  url?: string;
  embedCode?: string;
  type?: string;
}

const SocialButton = ({ color, icon }: { color: string; icon: React.ReactNode }) => (
  <button className={`${color} text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:opacity-90 transition shadow-sm`}>
    {icon}
  </button>
);

const NewsWebsite = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Data State
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [trainingList, setTrainingList] = useState<TrainingItem[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Helper to open media detail
  const openMedia = (media: MediaItem) => {
    setSelectedMedia(media);
    setActiveTab('mediaDetail');
    window.scrollTo(0, 0);
  };

  // UI State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false); // New Media Modal
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Edit State
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Login Form State
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [albumFiles, setAlbumFiles] = useState<File[]>([]);
  const [albumPreviews, setAlbumPreviews] = useState<string[]>([]);

  // Media Form State (NEW)
  const [mediaForm, setMediaForm] = useState({
    title: '',
    category: 'image', // 'image' or 'video'
    sourceType: 'upload', // 'upload', 'link', 'embed'
    url: '', // For Link
    embedCode: '' // For Embed
  });

  // Navigation & Selection State
  const [activeTab, setActiveTab] = useState('home');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<TrainingItem | null>(null);
  const [fontSize, setFontSize] = useState(18);

  // News & Training Forms State
  const [newsForm, setNewsForm] = useState({ title: '', category: 'ทั่วไป', image: '', album: [] as string[], time: 'เมื่อสักครู่', content: '' });
  const [trainingForm, setTrainingForm] = useState({ title: '', rawDate: '', time: '', location: '', seats: '', price: '', speaker: '', speakerImage: '', type: 'Onsite', description: '' });

  // --- Mock Data (Fallback) ---
  const generateMockNews = () => {
    const base = [
      { id: 'm1', category: 'โซเชียล', title: 'หนุ่ม กรรชัย เคลื่อนไหว! โพสต์สั้นๆ หลังมีดราม่าร้อนระอุ', image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=400&auto=format&fit=crop', time: '1 ชั่วโมงที่แล้ว' },
      { id: 'm2', category: 'กีฬา', title: 'ลิเวอร์พูล ยิ้มแฉ่ง! แมนซิตี้ สะดุดเสมอ เชลซี 4-4 สุดมันส์ พรีเมียร์ลีก', image: 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=400&auto=format&fit=crop', time: '1 ชั่วโมงที่แล้ว' },
      { id: 'm3', category: 'เศรษฐกิจ', title: 'ราคาทองวันนี้ 21 พ.ย. ร่วงลง 100 บาท รีบเข้าร้านทองด่วน ก่อนราคาดีดกลับ', image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=400&auto=format&fit=crop', time: '2 ชั่วโมงที่แล้ว' },
      { id: 'm4', category: 'ไอที', title: 'Apple เตรียมเปิดตัว iPad รุ่นใหม่ ชิป M4 เร็วแรงกว่าเดิม 20%', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop', time: '3 ชั่วโมงที่แล้ว' },
      { id: 'm5', category: 'บันเทิง', title: 'เปิดภาพล่าสุด "น้องปีใหม่" ลูกสาวแม่แอฟ ยิ่งโตยิ่งสวยเหมือนแม่เปี๊ยบ', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=400&auto=format&fit=crop', time: '3 ชั่วโมงที่แล้ว' },
      { id: 'm6', category: 'การเมือง', title: 'จับตา! ประชุมสภาฯ วันนี้ ถกงบประมาณปี 69 ฝ่ายค้านเตรียมจัดหนัก', image: 'https://images.unsplash.com/photo-1541872703-74c5963631df?q=80&w=400&auto=format&fit=crop', time: '4 ชั่วโมงที่แล้ว' },
      { id: 'm7', category: 'รถยนต์', title: 'รีวิว Honda City Hatchback ไมเนอร์เชนจ์ ปรับโฉมใหม่ ไฉไลกว่าเดิม', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=400&auto=format&fit=crop', time: '5 ชั่วโมงที่แล้ว' },
      { id: 'm8', category: 'ต่างประเทศ', title: 'นาทีชีวิต! ช่วยลูกแมวติดใต้ท้องรถ ท่ามกลางอากาศหนาวจัด รอดหวุดหวิด', image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=400&auto=format&fit=crop', time: '6 ชั่วโมงที่แล้ว' }
    ];
    return [...base, ...base.map(n => ({ ...n, id: n.id + '_dup', title: n.title + ' (เก่า)' }))];
  };

  const mockLatestNews = generateMockNews();
  const displayNewsList = newsList.length > 0 ? newsList : mockLatestNews;

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [newsRes, trainingsRes, mediaRes] = await Promise.all([
        fetch('/api/news'),
        fetch('/api/trainings'),
        fetch('/api/media'),
      ]);

      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNewsList(newsData);
      }
      if (trainingsRes.ok) {
        const trainingsData = await trainingsRes.json();
        setTrainingList(trainingsData);
      }
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMediaList(mediaData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Date Formatting
  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('th-TH', options));
  }, []);

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Helpers
  const goHome = () => { setActiveTab('home'); setSelectedNews(null); window.scrollTo(0, 0); };
  const goToCalendar = (e?: React.MouseEvent) => { e?.preventDefault(); setActiveTab('calendar'); window.scrollTo(0, 0); };
  const goToAllNews = (e?: React.MouseEvent) => { e?.preventDefault(); setActiveTab('allNews'); window.scrollTo(0, 0); };
  const goToMedia = (e?: React.MouseEvent) => { e?.preventDefault(); setActiveTab('media'); window.scrollTo(0, 0); };
  const goToDashboard = (e?: React.MouseEvent) => { e?.preventDefault(); isAdmin ? setActiveTab('dashboard') : setShowLoginModal(true); window.scrollTo(0, 0); };
  const openNews = (newsItem: NewsItem) => { setSelectedNews(newsItem); setActiveTab('detail'); window.scrollTo(0, 0); };
  const openTraining = (training: TrainingItem) => { setSelectedTraining(training); setActiveTab('trainingDetail'); window.scrollTo(0, 0); };
  const handleMobileNav = (action: () => void) => { action(); setIsMobileMenuOpen(false); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setUploadPreview(URL.createObjectURL(file)); }
  };
  const handleAlbumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAlbumFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setAlbumPreviews(prev => [...prev, ...newPreviews]);
    }
  };
  const removeAlbumImage = (index: number) => {
    setAlbumFiles(prev => prev.filter((_, i) => i !== index));
    setAlbumPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Speaker Image Handling
  const handleSpeakerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In real app, we would use state for file upload
    }
  };

  // Media File Handling
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Check if video or image for preview
      if (file.type.startsWith('video')) {
        setUploadPreview(null); // No preview for video file yet in simple mode
      } else {
        setUploadPreview(URL.createObjectURL(file));
      }
    }
  };

  // *** SIMULATED UPLOAD ***
  const simulateUpload = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const randomSeed = Math.random();
      // Mock different URL for video vs image
      const isVideo = file.type.startsWith('video');
      const placeholderUrl = isVideo
        ? "https://www.w3schools.com/html/mov_bbb.mp4"
        : `https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop&random=${randomSeed}`;
      resolve(placeholderUrl);
    });
  };

  // --- Calendar Logic ---
  const handlePrevMonth = () => {
    setCalendarDate(prev => { const newDate = new Date(prev); newDate.setMonth(prev.getMonth() - 1); return newDate; });
  };
  const handleNextMonth = () => {
    setCalendarDate(prev => { const newDate = new Date(prev); newDate.setMonth(prev.getMonth() + 1); return newDate; });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCredentials.username === 'admin' && loginCredentials.password === 'sadi123') {
      setIsAdmin(true); setShowLoginModal(false); setLoginError(''); setLoginCredentials({ username: '', password: '' }); setActiveTab('dashboard');
    } else { setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (ลอง: admin / sadi123)'); }
  };
  const handleLogout = () => { setIsAdmin(false); goHome(); };

  // --- Open Edit Modal ---
  const openEditNews = (news: NewsItem) => {
    setEditingNewsId(news.id);
    setNewsForm({
      title: news.title,
      category: news.category || 'ทั่วไป',
      image: news.image,
      album: news.album || [],
      time: news.time,
      content: news.content || ''
    });
    setUploadPreview(news.image);
    setAlbumPreviews(news.album || []);
    setShowNewsModal(true);
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let imageUrl = newsForm.image;
      let albumUrls = newsForm.album || [];

      if (selectedFile) imageUrl = await simulateUpload(selectedFile);

      if (albumFiles.length > 0) {
        const uploadPromises = albumFiles.map(file => simulateUpload(file));
        const newAlbumUrls = await Promise.all(uploadPromises);
        albumUrls = [...albumUrls, ...newAlbumUrls];
      }

      const newsData = {
        title: newsForm.title,
        category: newsForm.category || 'ทั่วไป',
        image: imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=400&auto=format&fit=crop',
        album: albumUrls,
        time: newsForm.time,
        content: newsForm.content,
      };

      if (editingNewsId) {
        await fetch(`/api/news/${editingNewsId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newsData),
        });
      } else {
        await fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newsData),
        });
      }

      setShowNewsModal(false);
      setNewsForm({ title: '', category: 'ทั่วไป', image: '', album: [], time: 'เมื่อสักครู่', content: '' });
      setSelectedFile(null); setUploadPreview(null); setAlbumFiles([]); setAlbumPreviews([]); setEditingNewsId(null); setIsUploading(false);
      fetchData(); // Refresh data
    } catch (error) { console.error(error); setIsUploading(false); alert("Error saving news"); }
  };

  const handleAddTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = trainingForm.rawDate ? new Date(trainingForm.rawDate) : new Date();

    try {
      setIsUploading(true);
      const trainingData = {
        title: trainingForm.title,
        date: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        time: trainingForm.time,
        location: trainingForm.location,
        seats: parseInt(trainingForm.seats) || 0,
        available: parseInt(trainingForm.seats) || 0,
        price: trainingForm.price,
        type: trainingForm.type,
        speaker: trainingForm.speaker,
        speakerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
        description: trainingForm.description,
      };

      if (editingTrainingId) {
        await fetch(`/api/trainings/${editingTrainingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trainingData),
        });
      } else {
        await fetch('/api/trainings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trainingData),
        });
      }

      setShowTrainingModal(false);
      setTrainingForm({ title: '', rawDate: '', time: '', location: '', seats: '', price: '', speaker: '', speakerImage: '', type: 'Onsite', description: '' });
      setEditingTrainingId(null);
      setIsUploading(false);
      fetchData(); // Refresh data
    } catch (error) { console.error(error); setIsUploading(false); alert("Error saving training"); }
  };

  // --- Handle Add Media ---
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUploading(true);
      let mediaUrl = mediaForm.url;

      if (mediaForm.sourceType === 'upload' && selectedFile) {
        mediaUrl = await simulateUpload(selectedFile);
      }

      const mediaData = {
        title: mediaForm.title,
        category: mediaForm.category,
        sourceType: mediaForm.sourceType,
        url: mediaUrl,
        embedCode: mediaForm.embedCode,
      };

      if (editingMediaId) {
        await fetch(`/api/media/${editingMediaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mediaData),
        });
      } else {
        await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mediaData),
        });
      }

      setShowMediaModal(false);
      setMediaForm({ title: '', category: 'image', sourceType: 'upload', url: '', embedCode: '' });
      setSelectedFile(null);
      setUploadPreview(null);
      setEditingMediaId(null);
      setIsUploading(false);
      fetchData(); // Refresh data
    } catch (error) { console.error(error); setIsUploading(false); alert("Error saving media"); }
  };

  const openEditTraining = (t: TrainingItem) => {
    setEditingTrainingId(t.id.toString());
    // Convert date back to YYYY-MM-DD for input
    const dateStr = `${t.year}-${String(t.month + 1).padStart(2, '0')}-${String(t.date).padStart(2, '0')}`;
    setTrainingForm({
      title: t.title,
      rawDate: dateStr,
      time: t.time,
      location: t.location,
      seats: t.seats.toString(),
      price: t.price || '',
      speaker: t.speaker || '',
      speakerImage: t.speakerImage || '',
      type: t.type,
      description: t.description || ''
    });
    setShowTrainingModal(true);
  };

  const openEditMedia = (m: MediaItem) => {
    setEditingMediaId(m.id);
    setMediaForm({
      title: m.title,
      category: m.category,
      sourceType: m.sourceType,
      url: m.url || '',
      embedCode: m.embedCode || ''
    });
    if (m.sourceType === 'upload' && m.url) {
      setUploadPreview(m.url);
    }
    setShowMediaModal(true);
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (window.confirm('ยืนยันการลบข้อมูล?')) {
      try {
        await fetch(`/api/${collectionName}/${id}`, { method: 'DELETE' });
        fetchData(); // Refresh data
      } catch (error) { console.error(error); alert("Error deleting"); }
    }
  };

  const handleDeleteNews = (id: string) => {
    handleDelete('news', id);
  };

  // Static content
  const heroNews = {
    id: 'hero', category: 'สุขภาพ', title: 'ถั่ว 2 ชนิด คนไทยชอบกินมาก! กินบ่อย "ทำร้ายตับ" แม้มีประโยชน์ก็ไม่ควรกินเกิน', image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?q=80&w=1000&auto=format&fit=crop', time: '39 นาทีที่แล้ว', views: '12.5k',
    content: `<p class="mb-4">เมื่อพูดถึงถั่ว หลายคนอาจนึกถึง "อัลมอนด์" เพราะเป็นถั่วยอดนิยมในสหรัฐอเมริกา...</p>`
  };
  const sideNews: NewsItem[] = [
    { id: 's1', category: 'บันเทิง', title: '"แอน อลิชา" เปิดใจกลางไลฟ์ "แก๊งนางฟ้า" เป็นไปตามข่าว เผยสิ่งที่กังวลที่สุด', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop', time: '21-11-2025', date: '21-11-2025', tagColor: 'text-green-600' },
    { id: 's2', category: 'บันเทิง', title: '"ดีเจดาด้า" ถึงกับไปไม่เป็นเลย หลังรู้ข้อมูลอีกด้านของ "นานา ไรบีนา"', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop', time: '20-11-2025', date: '20-11-2025', tagColor: 'text-red-500' },
    { id: 's3', category: 'บันเทิง', title: 'คนที่ 4! "คริส หอวัง" ตามมาติดๆ อันฟอลโลว์ไอจี "นานา" แก๊งนางฟ้าแตก?', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop', time: '20-11-2025', date: '20-11-2025', tagColor: 'text-blue-500' },
    { id: 's4', category: 'ต่างประเทศ', title: 'ชายปวดท้องหนัก 3 วัน ถ่ายไม่ออก! หมอผงะเจอ "ถ้วยเซรามิก 8 ซม." อุดช่องทวาร', image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=400&auto=format&fit=crop', time: '21-11-2025', date: '21-11-2025', tagColor: 'text-yellow-600' }
  ];
  const mockTrainingEvents = [
    { id: 1, date: 24, month: 10, year: 2025, title: "เทคนิคการเขียนข่าวออนไลน์ให้น่าสนใจ", time: "09:00 - 16:00", location: "ห้องอบรม A1", seats: 30, available: 5, type: "Online/Onsite", price: "1,500 บาท", speaker: "คุณสมชาย ใจดี", description: "เรียนรู้เทคนิคการเขียนข่าวให้น่าสนใจ..." },
    { id: 2, date: 28, month: 10, year: 2025, title: "Video Content Creator Workshop", time: "13:00 - 17:00", location: "Studio 2", seats: 20, available: 0, type: "Onsite", price: "2,900 บาท", speaker: "คุณเจน ตัดต่อเทพ", description: "เวิร์คช็อปการตัดต่อวิดีโอด้วยมือถือ..." },
    { id: 3, date: 5, month: 11, year: 2025, title: "Digital Marketing 2026 Trends", time: "10:00 - 12:00", location: "Online Zoom", seats: 100, available: 45, type: "Online", price: "ฟรี", speaker: "Marketing Guru Team", description: "อัปเดตเทรนด์การตลาดดิจิทัลปี 2026..." },
    { id: 4, date: 15, month: 11, year: 2025, title: "AI for Journalists", time: "09:00 - 16:00", location: "ห้องคอมพิวเตอร์ 3", seats: 25, available: 12, type: "Onsite", price: "3,500 บาท", speaker: "Dr. AI", description: "การใช้ AI เพื่อช่วยในการเขียนข่าว..." }
  ];
  const displayTrainingList = trainingList.length > 0 ? trainingList : mockTrainingEvents;

  // --- RENDER VIEWS ---

  // 1. Dashboard View (Updated with Media Table)
  const renderDashboardView = () => {
    const totalNews = displayNewsList.length;
    const totalTrainings = displayTrainingList.length;
    const totalMedia = mediaList.length;

    return (
      <div className="animate-fade-in pb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500"><button onClick={goHome} className="flex items-center gap-1 hover:text-red-600 transition"><ArrowLeft size={16} /> หน้าแรก</button><ChevronRight size={14} /><span className="font-bold text-gray-900">Dashboard</span></div>
          <div className="text-sm text-gray-500 hidden sm:block">System Status: <span className="text-green-600 font-bold">Online</span></div>
        </div>
        <div className="mb-8 flex items-end justify-between">
          <div><h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2"><LayoutDashboard className="text-red-600" size={32} /> Backend Dashboard</h1><p className="text-gray-500">ระบบจัดการข้อมูลหลังบ้าน Sadi News</p></div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition"><LogOut size={18} /> ออกจากระบบ</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition"><div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><FileText size={24} /></div><div><p className="text-sm text-gray-500">ข่าวในระบบ</p><h3 className="text-2xl font-bold text-gray-900">{totalNews}</h3></div></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition"><div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center"><Calendar size={24} /></div><div><p className="text-sm text-gray-500">หลักสูตรอบรม</p><h3 className="text-2xl font-bold text-gray-900">{totalTrainings}</h3></div></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition"><div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center"><Film size={24} /></div><div><p className="text-sm text-gray-500">สื่อมัลติมีเดีย</p><h3 className="text-2xl font-bold text-gray-900">{totalMedia}</h3></div></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* News Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h3 className="font-bold text-gray-800 flex items-center gap-2"><ListFilter size={18} /> จัดการข่าว</h3><button onClick={() => { setEditingNewsId(null); setNewsForm({ title: '', category: 'ทั่วไป', image: '', album: [], time: 'เมื่อสักครู่', content: '' }); setUploadPreview(null); setAlbumPreviews([]); setShowNewsModal(true); }} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 flex items-center gap-1"><Plus size={12} /> เพิ่มข่าว</button></div>
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm text-left"><thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0"><tr><th className="px-4 py-3">หัวข้อข่าว</th><th className="px-4 py-3 text-right">จัดการ</th></tr></thead><tbody>{displayNewsList.map((news) => (<tr key={news.id} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-4 py-3 font-medium truncate max-w-[200px]">{news.title}</td><td className="px-4 py-3 text-right flex justify-end gap-2">{isAdmin && (<button onClick={() => openEditNews(news)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded" title="แก้ไข"><Edit size={16} /></button>)}<button onClick={() => news.id.toString().startsWith('m') ? alert('ข่าวตัวอย่างลบไม่ได้') : handleDelete('news', news.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded" title="ลบ"><Trash2 size={16} /></button></td></tr>))}</tbody></table>
            </div>
          </div>
          {/* Training Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar size={18} /> จัดการตารางอบรม</h3><button onClick={() => { setEditingTrainingId(null); setTrainingForm({ title: '', rawDate: '', time: '', location: '', seats: '', price: '', speaker: '', speakerImage: '', type: 'Onsite', description: '' }); setShowTrainingModal(true); }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 flex items-center gap-1"><Plus size={12} /> เพิ่มอบรม</button></div>
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm text-left"><thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0"><tr><th className="px-4 py-3">หลักสูตร</th><th className="px-4 py-3">วันที่</th><th className="px-4 py-3 text-right">จัดการ</th></tr></thead><tbody>{displayTrainingList.map((t) => (<tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-4 py-3 font-medium truncate max-w-[180px]">{t.title}</td><td className="px-4 py-3 text-xs text-gray-500">{t.date}/{t.month + 1}/{t.year}</td><td className="px-4 py-3 text-right flex justify-end gap-2"><button onClick={() => openEditTraining(t)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded" title="แก้ไข"><Edit size={16} /></button><button onClick={() => t.id.toString().length < 5 ? alert('ข้อมูลตัวอย่างลบไม่ได้') : handleDelete('trainings', t.id.toString())} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button></td></tr>))}</tbody></table>
            </div>
          </div>
        </div>

        {/* Media Table (NEW) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Film size={18} /> จัดการสื่อมัลติมีเดีย</h3>
            <button onClick={() => { setEditingMediaId(null); setMediaForm({ title: '', category: 'image', sourceType: 'upload', url: '', embedCode: '' }); setUploadPreview(null); setShowMediaModal(true); }} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 flex items-center gap-1"><Plus size={12} /> เพิ่มสื่อ</button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0"><tr><th className="px-4 py-3">ชื่อสื่อ</th><th className="px-4 py-3">ประเภท</th><th className="px-4 py-3">ที่มา</th><th className="px-4 py-3 text-right">จัดการ</th></tr></thead>
              <tbody>
                {mediaList.length === 0 ? (<tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">ยังไม่มีข้อมูลสื่อ</td></tr>) : (mediaList.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium truncate max-w-[300px] flex items-center gap-2">
                      {m.category === 'image' ? <ImageIcon size={14} className="text-blue-500" /> : <Video size={14} className="text-red-500" />}
                      {m.title}
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${m.category === 'image' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>{m.category === 'image' ? 'รูปภาพ' : 'วิดีโอ'}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500 capitalize">{m.sourceType}</td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2"><button onClick={() => openEditMedia(m)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded" title="แก้ไข"><Edit size={16} /></button><button onClick={() => handleDelete('media', m.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button></td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 2. All News View
  const renderAllNewsView = () => (
    <div className="animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-2 text-sm text-gray-500"><button onClick={goHome} className="flex items-center gap-1 hover:text-red-600 transition"><ArrowLeft size={16} /> หน้าแรก</button><ChevronRight size={14} /><span className="font-bold text-gray-900">ข่าวอัพเดททั้งหมด</span></div></div>
      <div className="mb-6"><h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Bell className="text-red-600" size={32} /> ข่าวอัพเดทล่าสุด</h1></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{displayNewsList.map((news) => (<div key={news.id} onClick={() => openNews(news)} className="group cursor-pointer flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-red-100"><div className="relative aspect-video overflow-hidden"><img src={news.image} alt={news.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=400&auto=format&fit=crop'; }} /></div><div className="p-4 flex flex-col flex-1"><h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-red-600 transition line-clamp-2 mb-3">{news.title}</h3><div className="mt-auto flex items-center justify-between text-xs text-gray-500 border-t pt-3"><div className="flex items-center gap-1"><Clock size={14} /><span>{news.time}</span></div><span className="text-blue-600">อ่านต่อ</span></div></div></div>))}</div>
    </div>
  );

  // 3. Calendar View & 4. Training Detail View & 5. News Detail View (Same as before)
  const renderCalendarView = () => {
    const year = calendarDate.getFullYear(); const month = calendarDate.getMonth(); const daysInMonth = new Date(year, month + 1, 0).getDate(); const startDayOffset = new Date(year, month, 1).getDay(); const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthsTh = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    return (
      <div className="animate-fade-in pb-10">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6"><button onClick={goHome} className="flex items-center gap-1 hover:text-red-600 transition"><ArrowLeft size={16} /> หน้าแรก</button><ChevronRight size={14} /><span className="font-bold text-gray-900">ปฏิทินการจัดอบรม</span></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2"><div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"><div className="bg-red-600 text-white p-6 flex justify-between items-center"><div><h2 className="text-2xl font-bold">{monthsTh[month]} {year + 543}</h2><p className="opacity-90 text-sm">{new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</p></div><div className="flex gap-2"><button onClick={handlePrevMonth} className="p-2 hover:bg-white/20 rounded-full transition"><ChevronRight className="rotate-180" size={20} /></button><button onClick={handleNextMonth} className="p-2 hover:bg-white/20 rounded-full transition"><ChevronRight size={20} /></button></div></div><div className="p-6"><div className="grid grid-cols-7 gap-2 mb-4 text-center font-bold text-gray-400 text-sm"><div>อา</div><div>จ</div><div>อ</div><div>พ</div><div>พฤ</div><div>ศ</div><div>ส</div></div><div className="grid grid-cols-7 gap-2">{Array.from({ length: startDayOffset }).map((_, i) => (<div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg"></div>))}{days.map(day => { const event = displayTrainingList.find(e => e.date === day && (e.month !== undefined ? e.month === month : true) && (e.year !== undefined ? e.year === year : true)); const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear(); return (<div key={day} className={`h-24 rounded-lg border ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-red-200'} p-2 flex flex-col justify-between relative transition-all group cursor-pointer`}><span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{day}</span>{event && (<div className="bg-red-100 text-red-700 text-[10px] p-1 rounded line-clamp-2 font-medium cursor-pointer" onClick={() => openTraining(event)}>{event.title}</div>)}</div>); })}</div></div></div></div>
          <div className="lg:col-span-1 space-y-6"><div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"><h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="text-red-600" /> หลักสูตรในเดือนนี้</h3><div className="space-y-4">{displayTrainingList.filter(e => e.month === undefined || e.month === month).length === 0 ? <p className="text-gray-400 text-sm text-center py-4">ไม่มีการอบรมในเดือนนี้</p> : displayTrainingList.filter(e => e.month === undefined || e.month === month).map((event) => (<div key={event.id} className="border-l-4 border-red-500 pl-4 py-1 relative group"><div className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Clock size={14} />{event.date} {monthsTh[month]} • {event.time}</div><h4 className="font-bold text-gray-800 group-hover:text-red-600 transition cursor-pointer" onClick={() => openTraining(event)}>{event.title}</h4><button onClick={() => openTraining(event)} className="mt-3 w-full bg-gray-900 text-white text-xs py-2 rounded hover:bg-red-600 transition">ดูรายละเอียด & ลงทะเบียน</button></div>))}</div></div></div>
        </div>
      </div>
    );
  };

  const renderTrainingDetailView = () => {
    const event = selectedTraining; if (!event) return null;
    return (
      <div className="animate-fade-in pb-10">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6"><button onClick={goHome} className="flex items-center gap-1 hover:text-red-600 transition"><ArrowLeft size={16} /> หน้าแรก</button><ChevronRight size={14} /><button onClick={goToCalendar} className="hover:text-red-600 transition">ปฏิทินการจัดอบรม</button><ChevronRight size={14} /><span className="font-bold text-gray-900 truncate max-w-[200px]">{event.title}</span></div>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden"><div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div><div className="relative z-10"><span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm mb-4 inline-block border border-white/30">{event.type}</span><h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{event.title}</h1><div className="flex flex-wrap gap-4 text-sm opacity-90"><div className="flex items-center gap-1.5"><Calendar size={16} /> {event.date} พฤศจิกายน 2568</div><div className="flex items-center gap-1.5"><Clock size={16} /> {event.time}</div></div></div></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8"><h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="text-red-600" size={24} /> รายละเอียดหลักสูตร</h3><div className="text-gray-600 leading-relaxed space-y-4 font-sans"><p>{event.description || 'หลักสูตรนี้ออกแบบมาเพื่อให้ผู้เข้าอบรมมีความรู้ความเข้าใจเกี่ยวกับ...'}</p></div></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4"><div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden border-2 border-gray-100"><img src={event.speakerImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop"} alt="Speaker" className="w-full h-full object-cover" /></div><div><h4 className="font-bold text-gray-900 text-lg">วิทยากร: {event.speaker}</h4><p className="text-sm text-gray-500 mt-1">ผู้เชี่ยวชาญที่มีประสบการณ์</p></div></div>
        </div>
      </div>
    );
  };

  const renderDetailView = () => {
    const news = selectedNews;
    if (!news) return null;
    const contentToRender = news.content || `<p class="mb-6"><b>${news.title}</b></p>...`;
    return (
      <div className="container mx-auto px-4 max-w-7xl py-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4"><button onClick={goHome} className="flex items-center gap-1 hover:text-red-600 transition"><ArrowLeft size={16} /> หน้าแรก</button><ChevronRight size={14} /><span className="text-red-600 font-bold">{news.category || 'ข่าวทั่วไป'}</span><ChevronRight size={14} /><span className="truncate max-w-[200px]">{news.title}</span></div>
        <div className="max-w-4xl mx-auto bg-white p-4 md:p-8 rounded-xl shadow-sm">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{news.title}</h1>
          <div className="flex items-center justify-between border-t border-b border-gray-100 py-4 mb-6"><div className="flex items-center gap-4 text-sm text-gray-500"><div className="flex items-center gap-1"><Clock size={16} /> {news.time || currentDate}</div><div className="flex items-center gap-1"><Activity size={16} /> {news.views || '1.2k'} อ่าน</div></div></div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6"><div className="flex items-center gap-2"><span className="text-sm font-bold text-gray-700 mr-2">แชร์เรื่องนี้</span><SocialButton color="bg-[#06C755]" icon={<span className="font-bold text-sm">LINE</span>} /><SocialButton color="bg-black" icon={<span className="font-bold text-sm">𝕏</span>} /><SocialButton color="bg-[#1877F2]" icon={<Facebook size={18} fill="white" />} /><SocialButton color="bg-[#F24C3D]" icon={<Copy size={18} />} /></div><div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"><button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="p-1 hover:text-red-600 text-xs">- ก</button><span className="text-gray-300">|</span><button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className="p-1 hover:text-red-600 text-lg">ก +</button></div></div>
          <div className="rounded-lg overflow-hidden mb-8 aspect-video shadow-sm bg-gray-100"><img src={news.image} alt={news.title} className="w-full h-full object-cover" /></div>
          <div className="text-gray-800 leading-relaxed space-y-6" style={{ fontSize: `${fontSize}px`, fontFamily: 'var(--font-noto-sans-thai)' }} dangerouslySetInnerHTML={{ __html: contentToRender }}></div>
          {news.album && news.album.length > 0 && (<div className="mt-12 pt-8 border-t border-gray-100"><h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Images className="text-red-600" size={24} /> อัลบั้มภาพ</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{news.album.map((imgUrl, index) => (<div key={index} className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-sm group cursor-pointer hover:shadow-md transition"><img src={imgUrl} alt={`Album ${index + 1}`} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" /></div>))}</div></div>)}
          <div className="mt-12 pt-8 border-t border-gray-200"><h3 className="text-xl font-bold mb-6 border-l-4 border-red-600 pl-3">ข่าวที่เกี่ยวข้อง</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{sideNews.slice(0, 4).map((item) => (<div key={item.id} onClick={() => openNews(item)} className="flex gap-4 group cursor-pointer"><div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg"><img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition" alt={item.title} /></div><div><h4 className="text-sm font-medium line-clamp-2 group-hover:text-red-600 transition mt-1">{item.title}</h4><div className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Clock size={10} /> {item.date}</div></div></div>))}</div></div>
        </div>
      </div>
    );
  };



  // 7. Media Detail View (NEW)
  const renderMediaDetailView = () => {
    const item = selectedMedia;
    if (!item) return null;

    // Filter related media (exclude current)
    const relatedMedia = mediaList.length > 0
      ? mediaList.filter(m => m.id !== item.id).slice(0, 4)
      : displayNewsList.slice(0, 4).map(n => ({ id: `related-${n.id}`, category: 'image', sourceType: 'link', url: n.image, title: n.title }));

    return (
      <div className="container mx-auto px-4 max-w-7xl py-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button onClick={goHome} className="flex items-center gap-1 hover:text-red-600 transition"><ArrowLeft size={16} /> หน้าแรก</button>
          <ChevronRight size={14} />
          <button onClick={goToMedia} className="hover:text-red-600 transition font-bold text-red-600">Media Gallery</button>
          <ChevronRight size={14} />
          <span className="truncate max-w-[200px]">{item.title}</span>
        </div>

        <div className="max-w-5xl mx-auto bg-white p-4 md:p-8 rounded-xl shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">{item.title}</h1>

          <div className="flex items-center justify-between border-t border-b border-gray-100 py-4 mb-6">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold uppercase">{item.category}</span>
              <div className="flex items-center gap-1"><Clock size={16} /> {currentDate}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700 mr-2 hidden sm:inline">แชร์</span>
              <SocialButton color="bg-[#06C755]" icon={<span className="font-bold text-sm">LINE</span>} />
              <SocialButton color="bg-[#1877F2]" icon={<Facebook size={16} fill="white" />} />
            </div>
          </div>

          <div className="rounded-xl overflow-hidden mb-8 aspect-video shadow-md bg-black flex items-center justify-center">
            {item.sourceType === 'embed' ? (
              <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: item.embedCode || '' }} />
            ) : (item.category === 'video' || item.type === 'video') ? (
              <video src={item.url} className="w-full h-full" controls autoPlay />
            ) : (
              <img src={item.url} alt={item.title} className="w-full h-full object-contain" />
            )}
          </div>

          {/* Related Media Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold mb-6 border-l-4 border-purple-600 pl-3 flex items-center gap-2">สื่อที่เกี่ยวข้อง</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedMedia.map((relItem, idx) => (
                <div key={idx} onClick={() => openMedia(relItem as MediaItem)} className="group cursor-pointer">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-2 relative shadow-sm">
                    {/* @ts-ignore */}
                    <img src={relItem.url || relItem.image} alt={relItem.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    {/* @ts-ignore */}
                    {(relItem.category === 'video' || relItem.type === 'video') && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-1.5 rounded-full">
                        <Play fill="white" className="text-white" size={12} />
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-medium line-clamp-2 group-hover:text-purple-600 transition">{relItem.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 8. Media View (Gallery)
  const renderMediaView = () => {
    // Combine Real Media & Mock for display
    const combinedMedia: MediaItem[] = [
      ...mediaList,
      // Fallback items to make the gallery look populated
      ...displayNewsList.map(n => ({ id: `mock-${n.id}`, category: 'image', sourceType: 'link', url: n.image, title: n.title })),
      { id: 'mock-video', category: 'video', sourceType: 'link', url: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'วิดีโอแนะนำ Sadi News' },
    ];

    return (
      <div className="animate-fade-in pb-10">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={goHome} className="flex items-center gap-1 hover:text-red-600 transition"><ArrowLeft size={16} /> หน้าแรก</button>
          <ChevronRight size={14} />
          <span className="font-bold text-gray-900">Media Gallery</span>
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-2"><Film className="text-red-600" size={32} /> คลังสื่อมัลติมีเดีย</h1>
          <p className="text-gray-500">รวมภาพและวิดีโอจากข่าวและกิจกรรมต่างๆ ของ Sadi News</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {combinedMedia.map((item, index) => (
            <div key={index} onClick={() => openMedia(item)} className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition aspect-video bg-black cursor-pointer">
              {item.sourceType === 'embed' ? (
                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: item.embedCode || '' }} />
              ) : (item.category === 'video' || item.type === 'video') ? (
                <video src={item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" controls />
              ) : (
                <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transform group-hover:scale-110 transition duration-500" />
              )}

              {item.sourceType !== 'embed' && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 pointer-events-none">
                  <span className="text-white text-sm font-medium line-clamp-2">{item.title}</span>
                  <span className="text-white/70 text-xs mt-1 capitalize">{item.category || item.type}</span>
                </div>
              )}

              {(item.category === 'video' || item.type === 'video') && item.sourceType !== 'embed' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full group-hover:scale-110 transition pointer-events-none">
                  <Play fill="white" className="text-white" size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 6. Home Page (Same)
  const renderHomeView = () => (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div><h1 className="text-3xl font-bold text-black flex items-baseline gap-3">เรื่องเด่นวันนี้<span className="text-sm font-normal text-gray-500 hidden sm:inline-block">{currentDate}</span></h1><p className="text-sm text-gray-500 sm:hidden mt-1">{currentDate}</p></div>
        <a href="#" className="flex items-center justify-center gap-2 border border-green-500 text-green-600 px-4 py-1.5 rounded hover:bg-green-50 transition font-medium text-sm whitespace-nowrap self-start md:self-auto"><span className="bg-green-600 text-white text-[10px] font-bold px-1 rounded">FACT CHECK</span>เช็กข่าวชัวร์<ChevronRight size={16} /></a>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 group cursor-pointer relative" onClick={() => openNews(heroNews)}><div className="relative overflow-hidden rounded-lg shadow-sm aspect-[16/10]"><img src={heroNews.image} alt={heroNews.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90"></div><div className="absolute bottom-0 left-0 p-6 w-full"><h2 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-3">{heroNews.title}</h2><div className="flex items-center text-gray-300 text-xs md:text-sm gap-4"><div className="flex items-center gap-1"><Clock size={14} /><span>{heroNews.time}</span></div><div className="flex items-center gap-1"><Activity size={14} /><span>{heroNews.views}</span></div></div></div></div></div>
        <div className="lg:col-span-5"><div className="grid grid-cols-2 gap-4 h-full">{sideNews.map((item) => (<div key={item.id} onClick={() => openNews(item)} className="group cursor-pointer flex flex-col relative"><div className="relative overflow-hidden rounded-lg aspect-video mb-2"><img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" /><div className="absolute bottom-2 left-2"></div></div><h3 className="text-sm md:text-base font-semibold text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-3">{item.title}</h3><div className={`mt-auto pt-2 text-xs flex items-center gap-2 text-gray-500`}><Clock size={12} /><span>{item.date}</span></div></div>))}</div></div>
      </div>
      <div className="mt-10"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><h2 className="text-xl font-bold text-black border-l-4 border-red-600 pl-3">ข่าวล่าสุด</h2>{isLoading && <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"></div>}</div><button onClick={goToAllNews} className="text-sm text-gray-500 hover:text-red-600 flex items-center">ดูทั้งหมด <ChevronRight size={16} /></button></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayNewsList.slice(0, 8).map((news) => (
            <div key={news.id} onClick={() => openNews(news)} className="group cursor-pointer flex flex-col relative bg-white p-3 rounded-xl border border-transparent hover:border-gray-200 hover:shadow-sm transition-all animate-fade-in">
              <div className="relative overflow-hidden rounded-lg aspect-video mb-3"><img src={news.image} alt={news.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=400&auto=format&fit=crop'; }} /><div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">อ่านต่อ</div></div>
              <div className="flex flex-col flex-1"><h3 className="text-base font-semibold text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2 mb-2">{news.title}</h3><div className="mt-auto flex items-center justify-between text-xs text-gray-500"><div className="flex items-center gap-1"><Clock size={12} /><span>{news.time}</span></div></div></div>
              {isAdmin && !news.id.toString().startsWith('m') && (<div className="absolute top-2 right-2 flex gap-1"><button onClick={(e) => { e.stopPropagation(); openEditNews(news); }} className="bg-blue-600 text-white p-1.5 rounded-full shadow hover:bg-blue-700 transition" title="แก้ไข"><Edit size={14} /></button><button onClick={(e) => { e.stopPropagation(); handleDeleteNews(news.id); }} className="bg-red-600 text-white p-1.5 rounded-full shadow hover:bg-red-700 transition" title="ลบ"><Trash2 size={14} /></button></div>)}
            </div>
          ))}
        </div>
      </div>

      {/* Training Highlights Section */}
      <div className="mt-12 bg-gray-900 -mx-4 px-4 py-12 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8 text-white">
            <h2 className="text-2xl font-bold border-l-4 border-red-500 pl-4 flex items-center gap-2"><Calendar className="text-red-500" /> ตารางอบรมเร็วๆ นี้</h2>
            <button onClick={goToCalendar} className="text-sm text-gray-400 hover:text-white flex items-center transition">ดูปฏิทินทั้งหมด <ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayTrainingList.slice(0, 4).map((event) => (
              <div key={event.id} onClick={() => openTraining(event)} className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition cursor-pointer group border border-gray-700 hover:border-gray-600 relative">
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-lg z-10">{event.type}</div>
                <div className="p-6">
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-bold text-white tracking-tighter">{event.date}</span>
                    <span className="text-sm text-gray-400 uppercase tracking-wide">/{event.month !== undefined ? ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][event.month] : 'X'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition leading-snug">{event.title}</h3>
                  <div className="text-gray-400 text-xs flex items-center gap-2 mb-4">
                    <Clock size={12} /> {event.time}
                  </div>
                  <button className="w-full bg-white/5 text-gray-300 hover:bg-red-600 hover:text-white py-2 rounded-lg text-xs font-bold transition">ลงทะเบียน</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media Highlights Section */}
      <div className="mt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black border-l-4 border-purple-600 pl-3 flex items-center gap-2"><Film className="text-purple-600" /> มัลติมีเดียล่าสุด</h2>
          <button onClick={goToMedia} className="text-sm text-gray-500 hover:text-purple-600 flex items-center transition">ดูทั้งหมด <ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(mediaList.length > 0 ? mediaList.slice(0, 4) : displayNewsList.slice(0, 4).map(n => ({ id: `home-media-${n.id}`, category: 'image', sourceType: 'link', url: n.image, title: n.title }))).map((item, idx) => (
            <div key={idx} onClick={() => openMedia(item as MediaItem)} className="group relative rounded-lg overflow-hidden aspect-video bg-black cursor-pointer shadow-sm hover:shadow-lg transition">
              {/* @ts-ignore */}
              <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transform group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <span className="text-white text-xs font-medium line-clamp-1">{item.title}</span>
              </div>
              {/* @ts-ignore */}
              {(item.category === 'video' || item.type === 'video') && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full">
                  <Play fill="white" className="text-white" size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col" style={{ fontFamily: '"Noto Sans Thai", sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&display=swap');@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');.animate-spin-slow { animation: spin 3s linear infinite; }@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }.animate-slide-in-left { animation: slideInLeft 0.3s ease-out forwards; }`}</style>
      <header className="bg-red-700 shadow-md sticky top-0 z-50"><div className="container mx-auto px-4 max-w-7xl"><div className="flex items-center justify-between h-16"><div className="flex items-center gap-4"><button className="lg:hidden text-white hover:text-gray-200 transition" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button><a href="#" onClick={(e) => { e.preventDefault(); goHome(); }} className="flex items-center gap-2 group"><div className="text-3xl tracking-tighter text-white flex items-center" style={{ fontFamily: "'Poppins', sans-serif" }}><span className="font-bold mr-1">Sadi</span><span className="font-light">News</span></div></a></div><div className="hidden lg:flex items-center gap-6 text-sm font-medium text-red-100 flex-1 justify-end mr-6"><a href="#" onClick={(e) => { e.preventDefault(); goHome(); }} className={`hover:text-white transition-colors flex items-center gap-1.5 group ${activeTab === 'home' ? 'text-white font-bold' : ''}`}><Home size={18} /> หน้าแรก</a><a href="#" onClick={goToAllNews} className={`hover:text-white transition-colors flex items-center gap-1.5 group ${activeTab === 'allNews' ? 'text-white font-bold' : ''}`}><Bell size={18} className={activeTab !== 'allNews' ? "group-hover:animate-swing" : ""} /> ข่าวอัพเดท</a><a href="#" onClick={goToCalendar} className={`hover:text-white transition-colors flex items-center gap-1.5 group ${activeTab === 'calendar' ? 'text-white font-bold' : ''}`}><Calendar size={18} /> ปฏิทินการจัดอบรม</a><a href="#" onClick={goToMedia} className={`hover:text-white transition-colors flex items-center gap-1.5 group ${activeTab === 'media' ? 'text-white font-bold' : ''}`}><Film size={18} /> Media</a></div><div className="hidden sm:flex items-center gap-4 text-sm font-medium"><button onClick={() => isAdmin ? setActiveTab('dashboard') : setShowLoginModal(true)} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isAdmin ? 'bg-white text-red-700 shadow-lg font-bold' : 'bg-red-800/50 text-white hover:bg-red-800 border border-red-600'}`}><Settings size={18} className={isAdmin ? "animate-spin-slow" : ""} />{isAdmin ? 'จัดการระบบ' : 'Admin Login'}</button></div></div></div></header>

      <main className="flex-1 container mx-auto px-4 max-w-7xl py-8">
        {activeTab === 'home' && renderHomeView()}
        {activeTab === 'dashboard' && renderDashboardView()}
        {activeTab === 'allNews' && renderAllNewsView()}
        {activeTab === 'calendar' && renderCalendarView()}
        {activeTab === 'trainingDetail' && renderTrainingDetailView()}
        {activeTab === 'detail' && renderDetailView()}
        {activeTab === 'media' && renderMediaView()}
        {activeTab === 'mediaDetail' && renderMediaDetailView()}
      </main>
      {isMobileMenuOpen && (<div className="fixed inset-0 z-[60] lg:hidden"><div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div><div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl p-6 animate-slide-in-left flex flex-col"><div className="flex justify-between items-center mb-8"><div className="text-3xl tracking-tighter text-black flex items-center" style={{ fontFamily: "'Poppins', sans-serif" }}><span className="font-bold mr-1">Sadi</span><span className="font-light">News</span></div><button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-red-600"><X size={24} /></button></div><nav className="flex flex-col gap-2"><a href="#" onClick={(e) => handleMobileNav(() => { e.preventDefault(); goHome(); })} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'home' ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}><Home size={20} /> หน้าแรก</a><a href="#" onClick={(e) => handleMobileNav(() => goToAllNews(e))} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'allNews' ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}><Bell size={20} /> ข่าวอัพเดท</a><a href="#" onClick={(e) => handleMobileNav(() => goToCalendar(e))} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'calendar' ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}><Calendar size={20} /> ปฏิทินการจัดอบรม</a><a href="#" onClick={(e) => handleMobileNav(() => goToMedia(e))} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'media' ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}><Film size={20} /> Media</a></nav><div className="mt-auto border-t pt-6"><button onClick={() => { if (!isAdmin) setShowLoginModal(true); else setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${isAdmin ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Settings size={18} className={isAdmin ? "animate-spin-slow" : ""} />{isAdmin ? 'จัดการระบบ' : 'Admin Login'}</button></div></div></div>)}
      {showLoginModal && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"><div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in-up"><div className="bg-red-700 text-white p-6 text-center"><h3 className="text-xl font-bold">เข้าสู่ระบบผู้ดูแล</h3><p className="text-xs opacity-80 mt-1">Sadi News Management System</p></div><form onSubmit={handleLogin} className="p-6 space-y-4">{loginError && <div className="bg-red-50 text-red-600 text-xs p-3 rounded border border-red-100 flex items-center gap-2"><div className="w-1 h-1 bg-red-600 rounded-full"></div>{loginError}</div>}<div><label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Username</label><div className="relative"><User className="absolute left-3 top-2.5 text-gray-400" size={16} /><input type="text" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm" placeholder="admin" value={loginCredentials.username} onChange={(e) => setLoginCredentials({ ...loginCredentials, username: e.target.value })} /></div></div><div><label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Password</label><div className="relative"><Lock className="absolute left-3 top-2.5 text-gray-400" size={16} /><input type="password" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm" placeholder="••••••" value={loginCredentials.password} onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })} /></div></div><button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition shadow-lg mt-2">Login</button><button type="button" onClick={() => setShowLoginModal(false)} className="w-full text-gray-400 text-xs hover:text-gray-600">ยกเลิก</button></form></div></div>)}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {editingNewsId ? <Edit size={20} className="text-yellow-400" /> : <Plus size={20} className="text-green-400" />}
                {editingNewsId ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}
              </h3>
              <button onClick={() => setShowNewsModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddNews} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อข่าว</label><input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดข่าว</label><textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none h-32 resize-none focus:ring-2 focus:ring-red-100 transition" placeholder="ใส่เนื้อหาข่าวที่นี่..." value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} ></textarea></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">เวลา</label><input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" value={newsForm.time} onChange={(e) => setNewsForm({ ...newsForm, time: e.target.value })} /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพหลัก (Cover)</label><div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">{uploadPreview ? (<><img src={uploadPreview} className="h-32 object-cover rounded-lg shadow-sm" alt="Preview" /><button type="button" onClick={() => { setUploadPreview(null); setSelectedFile(null); }} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"><X size={14} /></button></>) : (<><UploadCloud size={32} className="text-gray-400" /><span className="text-sm text-gray-500">เลือกรูปภาพหลัก</span><input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" /></>)}</div><div className="mt-2 text-center text-xs text-gray-400">- หรือใส่ URL -</div><input type="url" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none text-sm mt-1" placeholder="https://example.com/image.jpg" value={newsForm.image} onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">อัลบั้มรูปภาพ (เพิ่มเติม)</label><div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative"><Images size={32} className="text-gray-400" /><span className="text-sm text-gray-500">คลิกเพื่อเลือกหลายรูป</span><input type="file" accept="image/*" multiple onChange={handleAlbumChange} className="absolute inset-0 opacity-0 cursor-pointer" /></div>{albumPreviews.length > 0 && (<div className="grid grid-cols-4 gap-2 mt-3">{albumPreviews.map((url, index) => (<div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200"><img src={url} className="w-full h-full object-cover" alt={`Album ${index}`} /><button type="button" onClick={() => removeAlbumImage(index)} className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"><X size={12} /></button></div>))}</div>)}</div>
              <div className="pt-4 flex justify-end gap-3 border-t"><button type="button" onClick={() => setShowNewsModal(false)} className="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">ยกเลิก</button><button type="submit" disabled={isUploading} className={`px-6 py-2 rounded-lg text-white font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${editingNewsId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}>{isUploading ? <><Loader2 size={18} className="animate-spin" /> กำลังอัปโหลด...</> : (editingNewsId ? 'บันทึกการแก้ไข' : 'บันทึกข่าวลงระบบ')}</button></div>
            </form>
          </div>
        </div>
      )}
      {showTrainingModal && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"><div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in-up"><div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center"><h3 className="text-lg font-bold flex items-center gap-2"><Calendar size={20} className="text-blue-200" /> {editingTrainingId ? 'แก้ไขหลักสูตรอบรม' : 'เพิ่มหลักสูตรอบรม'}</h3><button onClick={() => setShowTrainingModal(false)} className="text-blue-200 hover:text-white"><X size={24} /></button></div><form onSubmit={handleAddTraining} className="p-6 space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">ชื่อหลักสูตร</label><input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" value={trainingForm.title} onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })} /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">วันที่ (MM/DD/YYYY)</label><input type="date" required className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" value={trainingForm.rawDate} onChange={(e) => setTrainingForm({ ...trainingForm, rawDate: e.target.value })} /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">เวลา (เช่น 09:00-16:00)</label><input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" value={trainingForm.time} onChange={(e) => setTrainingForm({ ...trainingForm, time: e.target.value })} /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">สถานที่</label><input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" value={trainingForm.location} onChange={(e) => setTrainingForm({ ...trainingForm, location: e.target.value })} /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label><select className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none bg-white" value={trainingForm.type} onChange={(e) => setTrainingForm({ ...trainingForm, type: e.target.value })}><option>Onsite</option><option>Online</option><option>Hybrid</option></select></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">จำนวนรับ (ท่าน)</label><input type="number" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" value={trainingForm.seats} onChange={(e) => setTrainingForm({ ...trainingForm, seats: e.target.value })} /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">ราคา</label><input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" value={trainingForm.price} onChange={(e) => setTrainingForm({ ...trainingForm, price: e.target.value })} /></div></div>
        <div className="grid grid-cols-2 gap-4 items-end">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">วิทยากร</label><input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" value={trainingForm.speaker} onChange={(e) => setTrainingForm({ ...trainingForm, speaker: e.target.value })} /></div>
          <div className="relative"><input type="file" id="speaker-upload" className="hidden" accept="image/*" onChange={handleSpeakerFileChange} /><label htmlFor="speaker-upload" className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm text-gray-600"><UploadCloud size={18} />{trainingForm.speakerImage ? 'เปลี่ยนรูป' : 'รูปวิทยากร'}</label></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดโครงการ</label><textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none h-24 resize-none focus:ring-2 focus:ring-blue-100 transition" placeholder="ใส่รายละเอียดเพิ่มเติม..." value={trainingForm.description} onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })} ></textarea></div><div className="pt-4 flex justify-end gap-3 border-t"><button type="button" onClick={() => setShowTrainingModal(false)} className="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">ยกเลิก</button><button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg">{editingTrainingId ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}</button></div></form></div></div>)}

      {/* Add Media Modal (NEW) */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-purple-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2"><Film size={20} /> {editingMediaId ? 'แก้ไขสื่อมัลติมีเดีย' : 'เพิ่มสื่อมัลติมีเดีย'}</h3>
              <button onClick={() => setShowMediaModal(false)} className="text-white hover:text-purple-200"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddMedia} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อ / คำอธิบาย</label><input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" value={mediaForm.title} onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })} /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทสื่อ</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="cat" checked={mediaForm.category === 'image'} onChange={() => setMediaForm({ ...mediaForm, category: 'image' })} /> <ImageIcon size={16} /> รูปภาพ</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="cat" checked={mediaForm.category === 'video'} onChange={() => setMediaForm({ ...mediaForm, category: 'video' })} /> <Video size={16} /> วิดีโอ</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ที่มา (Source)</label>
                <div className="flex gap-2 mb-3">
                  <button type="button" onClick={() => setMediaForm({ ...mediaForm, sourceType: 'upload' })} className={`px-3 py-1 rounded text-xs border ${mediaForm.sourceType === 'upload' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300'}`}>อัปโหลดไฟล์</button>
                  <button type="button" onClick={() => setMediaForm({ ...mediaForm, sourceType: 'link' })} className={`px-3 py-1 rounded text-xs border ${mediaForm.sourceType === 'link' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300'}`}>ลิงก์ภายนอก (URL)</button>
                  <button type="button" onClick={() => setMediaForm({ ...mediaForm, sourceType: 'embed' })} className={`px-3 py-1 rounded text-xs border ${mediaForm.sourceType === 'embed' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300'}`}>Embed Code</button>
                </div>

                {mediaForm.sourceType === 'upload' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
                    {uploadPreview ? (
                      mediaForm.category === 'image' ? <img src={uploadPreview} className="h-32 object-contain" /> : <div className="flex items-center gap-2 text-green-600"><CheckCircle /> พร้อมอัปโหลดวิดีโอ</div>
                    ) : (
                      <><UploadCloud size={32} className="text-gray-400" /><span className="text-sm text-gray-500">คลิกเพื่อเลือกไฟล์</span></>
                    )}
                    <input type="file" accept={mediaForm.category === 'image' ? "image/*" : "video/*"} onChange={handleMediaFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                )}

                {mediaForm.sourceType === 'link' && (
                  <div className="relative"><LinkIcon className="absolute left-3 top-2.5 text-gray-400" size={16} /><input type="url" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg outline-none" placeholder="https://example.com/file.mp4" value={mediaForm.url} onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })} /></div>
                )}

                {mediaForm.sourceType === 'embed' && (
                  <div className="relative"><Code className="absolute left-3 top-2.5 text-gray-400" size={16} /><textarea className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg outline-none h-24 resize-none font-mono text-xs" placeholder='<iframe src="..." ...></iframe>' value={mediaForm.embedCode} onChange={(e) => setMediaForm({ ...mediaForm, embedCode: e.target.value })}></textarea></div>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t"><button type="button" onClick={() => setShowMediaModal(false)} className="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">ยกเลิก</button><button type="submit" disabled={isUploading} className="px-6 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg flex items-center gap-2">{isUploading ? <><Loader2 size={18} className="animate-spin" /> กำลังบันทึก...</> : (editingMediaId ? 'บันทึกการแก้ไข' : 'บันทึกสื่อ')}</button></div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-gray-400 py-10 mt-10"><div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8 text-sm"><div><div className="text-2xl tracking-tighter text-white mb-4 flex items-center" style={{ fontFamily: "'Poppins', sans-serif" }}><span className="font-bold mr-1">Sadi</span><span className="font-light">News</span></div><p>สถาบันพัฒนาการตรวจเงินแผ่นดิน</p></div><div><h4 className="text-white font-bold mb-4">ติดตามเรา</h4><div className="flex gap-4"><div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">f</div><div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white">t</div><div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white">y</div></div></div></div></footer>
    </div>
  );
};

export default NewsWebsite;