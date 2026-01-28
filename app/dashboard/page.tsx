'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, LayoutDashboard, FileText, Calendar, Film, ListFilter, Plus, Edit, Trash2, ArrowLeft, LogOut, X, Loader2, UploadCloud, Images, ImageIcon, Video, CheckCircle, Link as LinkIcon, Code } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NewsItem, TrainingItem, MediaItem } from '@/types';

export default function DashboardPage() {
    const router = useRouter();

    // Data State
    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    const [trainingList, setTrainingList] = useState<TrainingItem[]>([]);
    const [mediaList, setMediaList] = useState<MediaItem[]>([]);

    // UI State
    const [showNewsModal, setShowNewsModal] = useState(false);
    const [showTrainingModal, setShowTrainingModal] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');

    // Edit State
    const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
    const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
    const [editingMediaId, setEditingMediaId] = useState<string | null>(null);

    // Upload State
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [albumFiles, setAlbumFiles] = useState<File[]>([]);
    const [albumPreviews, setAlbumPreviews] = useState<string[]>([]);

    // Forms State
    const [newsForm, setNewsForm] = useState({ title: '', category: 'ทั่วไป', image: '', album: [] as string[], time: 'เมื่อสักครู่', content: '' });

    // Insert Image State
    const [isInsertingImage, setIsInsertingImage] = useState(false);
    const [trainingForm, setTrainingForm] = useState({ title: '', rawDate: '', time: '', location: '', seats: '', price: '', speaker: '', speakerImage: '', type: 'Onsite', description: '' });
    const [mediaForm, setMediaForm] = useState({ title: '', category: 'image', sourceType: 'upload', url: '', embedCode: '', description: '' });

    // Fetch Data
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [newsRes, trainingsRes, mediaRes] = await Promise.all([
                fetch('/api/news'),
                fetch('/api/trainings'),
                fetch('/api/media'),
            ]);

            if (newsRes.ok) setNewsList(await newsRes.json());
            if (trainingsRes.ok) setTrainingList(await trainingsRes.json());
            if (mediaRes.ok) setMediaList(await mediaRes.json());
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const admin = localStorage.getItem('isAdmin');
        if (admin === 'true') {
            setIsLoggedIn(true);
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [fetchData]);

    // Handlers
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin1234') {
            localStorage.setItem('isAdmin', 'true');
            setIsLoggedIn(true);
            fetchData();
        } else {
            alert('รหัสผ่านไม่ถูกต้อง');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        setIsLoggedIn(false);
        router.push('/');
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center font-sans p-4">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white">
                            <LogOut size={32} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Login</h2>
                    <p className="text-center text-gray-500 mb-8">กรุณาเข้าสู่ระบบเพื่อจัดการข้อมูล</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter password..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="w-full bg-red-600 text-white rounded-lg py-2.5 font-bold hover:bg-red-700 transition shadow-lg">
                            เข้าสู่ระบบ
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm flex items-center justify-center gap-1">
                            <ArrowLeft size={14} /> กลับหน้าแรก
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const uploadFile = async (file: File): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            return data.url;
        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    };

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

    const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('video')) {
                setUploadPreview(null);
            } else {
                setUploadPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSpeakerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setIsUploading(true);
                const url = await uploadFile(file);
                setTrainingForm(prev => ({ ...prev, speakerImage: url }));
            } catch (error) {
                alert('Failed to upload speaker image');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleDelete = async (collectionName: string, id: string) => {
        if (window.confirm('ยืนยันการลบข้อมูล?')) {
            try {
                await fetch(`/api/${collectionName}/${id}`, { method: 'DELETE' });
                fetchData();
            } catch (error) { console.error(error); alert("Error deleting"); }
        }
    };

    // Add/Edit Handlers
    const handleAddNews = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsUploading(true);
            let imageUrl = newsForm.image;
            let albumUrls = newsForm.album || [];

            if (selectedFile) imageUrl = await uploadFile(selectedFile);

            if (albumFiles.length > 0) {
                const uploadPromises = albumFiles.map(file => uploadFile(file));
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
            fetchData();
        } catch (error) { console.error(error); setIsUploading(false); alert("Error saving news"); }
    };

    const handleInsertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsInsertingImage(true);
            const url = await uploadFile(file);
            const imgTag = `<img src="${url}" alt="inserted image" />\n`;

            setNewsForm(prev => ({
                ...prev,
                content: prev.content + imgTag
            }));
        } catch (error) {
            console.error('Failed to insert image:', error);
            alert('Failed to upload image');
        } finally {
            setIsInsertingImage(false);
            // Reset input
            e.target.value = '';
        }
    };



    const handleInsertMediaDescriptionImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsInsertingImage(true);
            const url = await uploadFile(file);
            const imgTag = `<img src="${url}" alt="inserted image" />\n`;

            setMediaForm(prev => ({
                ...prev,
                description: (prev.description || '') + imgTag
            }));
        } catch (error) {
            console.error('Failed to insert image:', error);
            alert('Failed to upload image');
        } finally {
            setIsInsertingImage(false);
            // Reset input
            e.target.value = '';
        }
    };


    const handleInsertTrainingDescriptionImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsInsertingImage(true);
            const url = await uploadFile(file);
            const imgTag = `<img src="${url}" alt="inserted image" />\n`;

            setTrainingForm(prev => ({
                ...prev,
                description: (prev.description || '') + imgTag
            }));
        } catch (error) {
            console.error('Failed to insert image:', error);
            alert('Failed to upload image');
        } finally {
            setIsInsertingImage(false);
            // Reset input
            e.target.value = '';
        }
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
            fetchData();
        } catch (error) { console.error(error); setIsUploading(false); alert("Error saving training"); }
    };

    const handleAddMedia = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsUploading(true);
            let mediaUrl = mediaForm.url;

            if (mediaForm.sourceType === 'upload' && selectedFile) {
                mediaUrl = await uploadFile(selectedFile);
            }

            const mediaData = {
                title: mediaForm.title,
                category: mediaForm.category,
                sourceType: mediaForm.sourceType,
                url: mediaUrl,
                embedCode: mediaForm.embedCode,
                description: mediaForm.description,
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
            setMediaForm({ title: '', category: 'image', sourceType: 'upload', url: '', embedCode: '', description: '' });
            setSelectedFile(null);
            setUploadPreview(null);
            setEditingMediaId(null);
            setIsUploading(false);
            fetchData();
        } catch (error) { console.error(error); setIsUploading(false); alert("Error saving media"); }
    };

    // Open Edit Modals
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

    const openEditTraining = (t: TrainingItem) => {
        setEditingTrainingId(t.id.toString());
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
            embedCode: m.embedCode || '',
            description: m.description || '' // Add type MediaItem description potentially undefined
        });
        if (m.sourceType === 'upload' && m.url) {
            setUploadPreview(m.url);
        }
        setShowMediaModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="container mx-auto max-w-7xl animate-fade-in pb-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="flex items-center gap-1 hover:text-red-600 transition">
                            <ArrowLeft size={16} /> หน้าแรก
                        </Link>
                        <ChevronRight size={14} />
                        <span className="font-bold text-gray-900">Dashboard</span>
                    </div>
                    <div className="text-sm text-gray-500 hidden sm:block">System Status: <span className="text-green-600 font-bold">Online</span></div>
                </div>

                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                            <LayoutDashboard className="text-red-600" size={32} /> Backend Dashboard
                        </h1>
                        <p className="text-gray-500">ระบบจัดการข้อมูลหลังบ้าน Sadi News</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition">
                        <LogOut size={18} /> ออกจากระบบ
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><FileText size={24} /></div>
                        <div><p className="text-sm text-gray-500">ข่าวในระบบ</p><h3 className="text-2xl font-bold text-gray-900">{newsList.length}</h3></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center"><Calendar size={24} /></div>
                        <div><p className="text-sm text-gray-500">หลักสูตรอบรม</p><h3 className="text-2xl font-bold text-gray-900">{trainingList.length}</h3></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center"><Film size={24} /></div>
                        <div><p className="text-sm text-gray-500">สื่อมัลติมีเดีย</p><h3 className="text-2xl font-bold text-gray-900">{mediaList.length}</h3></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* News Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2"><ListFilter size={18} /> จัดการข่าว</h3>
                            <button
                                onClick={() => { setEditingNewsId(null); setNewsForm({ title: '', category: 'ทั่วไป', image: '', album: [], time: 'เมื่อสักครู่', content: '' }); setUploadPreview(null); setAlbumPreviews([]); setShowNewsModal(true); }}
                                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 flex items-center gap-1">
                                <Plus size={12} /> เพิ่มข่าว
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0"><tr><th className="px-4 py-3">หัวข้อข่าว</th><th className="px-4 py-3 text-right">จัดการ</th></tr></thead>
                                <tbody>
                                    {newsList.map((news) => (
                                        <tr key={news.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium truncate max-w-[200px]">{news.title}</td>
                                            <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                <button onClick={() => openEditNews(news)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded" title="แก้ไข"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete('news', news.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded" title="ลบ"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Training Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar size={18} /> จัดการตารางอบรม</h3>
                            <button
                                onClick={() => { setEditingTrainingId(null); setTrainingForm({ title: '', rawDate: '', time: '', location: '', seats: '', price: '', speaker: '', speakerImage: '', type: 'Onsite', description: '' }); setShowTrainingModal(true); }}
                                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 flex items-center gap-1">
                                <Plus size={12} /> เพิ่มอบรม
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0"><tr><th className="px-4 py-3">หลักสูตร</th><th className="px-4 py-3">วันที่</th><th className="px-4 py-3 text-right">จัดการ</th></tr></thead>
                                <tbody>
                                    {trainingList.map((t) => (
                                        <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium truncate max-w-[180px]">{t.title}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500">{t.date}/{t.month + 1}/{t.year}</td>
                                            <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                <button onClick={() => openEditTraining(t)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded" title="แก้ไข"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete('trainings', t.id.toString())} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Media Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Film size={18} /> จัดการสื่อมัลติมีเดีย</h3>
                        <button
                            onClick={() => { setEditingMediaId(null); setMediaForm({ title: '', category: 'image', sourceType: 'upload', url: '', embedCode: '', description: '' }); setUploadPreview(null); setShowMediaModal(true); }}
                            className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 flex items-center gap-1">
                            <Plus size={12} /> เพิ่มสื่อ
                        </button>
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
                                        <td className="px-4 py-3 text-right flex justify-end gap-2">
                                            <button onClick={() => openEditMedia(m)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded" title="แก้ไข"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete('media', m.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดข่าว</label>
                                <div className="mb-2">
                                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition">
                                        <Images size={14} />
                                        {isInsertingImage ? 'กำลังอัปโหลด...' : 'แทรกรูปภาพในเนื้อหา'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleInsertImage} disabled={isInsertingImage} />
                                    </label>
                                </div>
                                <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none h-32 resize-none focus:ring-2 focus:ring-red-100 transition" placeholder="ใส่เนื้อหาข่าวที่นี่..." value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">เวลา</label><input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" value={newsForm.time} onChange={(e) => setNewsForm({ ...newsForm, time: e.target.value })} /></div></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพหลัก (Cover)</label><div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">{uploadPreview ? (<><img src={uploadPreview} className="h-32 object-cover rounded-lg shadow-sm" alt="Preview" /><button type="button" onClick={() => { setUploadPreview(null); setSelectedFile(null); }} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"><X size={14} /></button></>) : (<><UploadCloud size={32} className="text-gray-400" /><span className="text-sm text-gray-500">เลือกรูปภาพหลัก</span><input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" /></>)}</div><div className="mt-2 text-center text-xs text-gray-400">- หรือใส่ URL -</div><input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none text-sm mt-1" placeholder="https://example.com/image.jpg" value={newsForm.image} onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })} /></div>
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดโครงการ</label>
                    <div className="mb-2">
                        <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition">
                            <Images size={14} />
                            {isInsertingImage ? 'กำลังอัปโหลด...' : 'แทรกรูปภาพ'}
                            <input type="file" accept="image/*" className="hidden" onChange={handleInsertTrainingDescriptionImage} disabled={isInsertingImage} />
                        </label>
                    </div>
                    <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none h-24 resize-none focus:ring-2 focus:ring-blue-100 transition" placeholder="ใส่รายละเอียดเพิ่มเติม..." value={trainingForm.description} onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })} ></textarea>
                </div><div className="pt-4 flex justify-end gap-3 border-t"><button type="button" onClick={() => setShowTrainingModal(false)} className="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">ยกเลิก</button><button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg">{editingTrainingId ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}</button></div></form></div></div>)}

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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม</label>
                                <div className="mb-2">
                                    <label className="cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition">
                                        <Images size={14} />
                                        {isInsertingImage ? 'กำลังอัปโหลด...' : 'แทรกรูปภาพ'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleInsertMediaDescriptionImage} disabled={isInsertingImage} />
                                    </label>
                                </div>
                                <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none h-32 resize-none focus:ring-2 focus:ring-purple-100 transition" placeholder="ใส่รายละเอียด..." value={mediaForm.description} onChange={(e) => setMediaForm({ ...mediaForm, description: e.target.value })} ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t"><button type="button" onClick={() => setShowMediaModal(false)} className="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">ยกเลิก</button><button type="submit" disabled={isUploading} className="px-6 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg flex items-center gap-2">{isUploading ? <><Loader2 size={18} className="animate-spin" /> กำลังบันทึก...</> : (editingMediaId ? 'บันทึกการแก้ไข' : 'บันทึกสื่อ')}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
