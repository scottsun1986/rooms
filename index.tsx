import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Monitor, 
  Calendar, 
  Clock, 
  Settings, 
  Plus, 
  Layout, 
  MapPin, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Grid,
  Edit3,
  Save,
  Cpu,
  Upload,
  Check
} from 'lucide-react';

// --- 模拟数据 ---

// 预设背景图库
const PRESET_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000', // 商务办公
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1000', // 会议室
  'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1000', // 实验室/科技
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000', // 抽象深色
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000', // 浅色明亮
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000'  // 开放区域
];

const INITIAL_ROOMS = [
  {
    id: 1,
    name: '总经理办公室',
    location: '20层 2001室',
    deviceSn: 'SN-2024-8801', 
    defaultBg: PRESET_BACKGROUNDS[0],
    type: 'office' 
  },
  {
    id: 2,
    name: '第一会议室',
    location: '20层 2008室',
    deviceSn: 'SN-2024-8802',
    defaultBg: PRESET_BACKGROUNDS[1],
    type: 'meeting'
  },
  {
    id: 3,
    name: '研发部实验室',
    location: '18层 1805室',
    deviceSn: 'SN-2024-6601',
    defaultBg: PRESET_BACKGROUNDS[2],
    type: 'office'
  },
  {
    id: 4,
    name: '开放办公区 A',
    location: '18层 1801室',
    deviceSn: 'SN-2024-6602',
    defaultBg: PRESET_BACKGROUNDS[5],
    type: 'office'
  }
];

// 预设一些日程，方便演示
const INITIAL_SCHEDULES = [
  {
    id: 101,
    roomId: 2,
    title: 'Q4 季度预算评审会',
    owner: '财务部 - 李总',
    status: 'busy', // busy | closed | free
    startTime: new Date().setHours(new Date().getHours() - 1), // 1小时前开始
    endTime: new Date().setHours(new Date().getHours() + 2),   // 2小时后结束
    bgImage: PRESET_BACKGROUNDS[4]
  },
  {
    id: 102,
    roomId: 1,
    title: '商务洽谈 - 不便打扰',
    owner: '张总',
    status: 'dnd',
    startTime: new Date().setHours(new Date().getHours() + 3), // 3小时后开始
    endTime: new Date().setHours(new Date().getHours() + 5),
    bgImage: PRESET_BACKGROUNDS[3]
  }
];

// --- 辅助函数 ---

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  return date.toLocaleDateString('zh-CN', options);
};

// 核心逻辑：计算当前房间应该显示什么内容
const getRoomStatus = (room: any, schedules: any[], currentTime: number) => {
  if (!room) return null;
  // 查找当前时间是否落在某个日程内
  const currentSchedule = schedules.find(s => 
    s.roomId === room.id && 
    currentTime >= s.startTime && 
    currentTime <= s.endTime
  );

  if (currentSchedule) {
    return {
      title: currentSchedule.title,
      subtitle: currentSchedule.owner,
      status: currentSchedule.status,
      bg: currentSchedule.bgImage || room.defaultBg,
      isSchedule: true,
      endTime: currentSchedule.endTime
    };
  }

  // 默认状态（无日程）
  return {
    title: room.name,
    subtitle: room.location,
    status: 'free',
    bg: room.defaultBg,
    isSchedule: false,
    endTime: null
  };
};

// 提取楼层信息的辅助函数
const getFloor = (location: string) => {
  const match = location.match(/(\d+)层/);
  return match ? `${match[1]}层` : '其他区域';
};

// --- 组件定义 ---

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | device
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null); // null 表示在概览模式
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
  
  // 模拟时间控制
  const [timeOffset, setTimeOffset] = useState(0); 
  const [realTime, setRealTime] = useState(new Date().getTime());

  // 系统时钟脉冲
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date().getTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 计算后的“当前系统时间”（加上了调试偏移量）
  const simulatedTime = realTime + timeOffset;

  const handleAddSchedule = (newSchedule: any) => {
    setSchedules([...schedules, { ...newSchedule, id: Date.now() }]);
  };

  const handleUpdateRoom = (updatedRoom: any) => {
    setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
  };

  // 获取当前选中的房间（如果有）用于模拟器显示
  const activeRoom = selectedRoomId ? rooms.find(r => r.id === selectedRoomId) : rooms[0];
  const roomStatus = getRoomStatus(activeRoom, schedules, simulatedTime);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-slate-800 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm z-10 border-b border-gray-200 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">
              D
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">智屏管理云平台</h1>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Layout size={16} />
              管理控制台
            </button>
            <button 
              onClick={() => setActiveTab('device')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'device' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Monitor size={16} />
              终端模拟器
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'dashboard' ? (
          <DashboardView 
            rooms={rooms} 
            schedules={schedules} 
            selectedRoomId={selectedRoomId}
            setSelectedRoomId={setSelectedRoomId}
            onAddSchedule={handleAddSchedule}
            onUpdateRoom={handleUpdateRoom}
            simulatedTime={simulatedTime}
            timeOffset={timeOffset}
            setTimeOffset={setTimeOffset}
            getRoomStatus={(r) => getRoomStatus(r, schedules, simulatedTime)}
          />
        ) : (
          <DeviceSimulator 
            room={activeRoom}
            statusData={roomStatus}
            currentTime={simulatedTime}
            allRooms={rooms}
            onSelectRoom={setSelectedRoomId}
          />
        )}
      </main>
    </div>
  );
}

// --- 子组件：管理后台 (包含概览和详情) ---

function DashboardView({ 
  rooms, 
  schedules, 
  selectedRoomId, 
  setSelectedRoomId, 
  onAddSchedule,
  onUpdateRoom,
  simulatedTime,
  timeOffset,
  setTimeOffset,
  getRoomStatus
}: any) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // 如果没有选中的房间，显示楼层网格概览
  if (!selectedRoomId) {
    // 按楼层分组
    const floors: any = {};
    rooms.forEach((room: any) => {
      const floor = getFloor(room.location);
      if (!floors[floor]) floors[floor] = [];
      floors[floor].push(room);
    });

    // 排序楼层（简单的字符串排序，实际可能需要更复杂的逻辑）
    const sortedFloors = Object.keys(floors).sort().reverse();

    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
           <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">楼宇全景概览</h2>
                <p className="text-gray-500 mt-1">实时监控各楼层房间状态及设备运行情况</p>
              </div>
              
              {/* 全局时间调试器 (Mini版) */}
              <div className="bg-white border border-yellow-200 rounded-full px-4 py-2 flex items-center gap-3 shadow-sm">
                <Clock className="text-yellow-600" size={16} />
                <span className="text-sm font-medium text-gray-700 font-mono">{new Date(simulatedTime).toLocaleTimeString()}</span>
                <input 
                   type="range" 
                   min="-86400000" max="86400000" step="3600000" 
                   value={timeOffset}
                   onChange={(e) => setTimeOffset(Number(e.target.value))}
                   className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
           </div>

           {sortedFloors.map(floor => (
             <div key={floor} className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-700 sticky top-0 bg-gray-50/95 backdrop-blur py-2 z-10">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                  {floor}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {floors[floor].map((room: any) => {
                    const status = getRoomStatus(room);
                    return (
                      <div 
                        key={room.id} 
                        onClick={() => setSelectedRoomId(room.id)}
                        className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col"
                      >
                         <div className="h-32 overflow-hidden relative">
                            <img src={status.bg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="room"/>
                            <div className="absolute top-2 right-2">
                               <StatusBadge status={status.status} size="sm" />
                            </div>
                         </div>
                         <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-900 truncate pr-2" title={room.name}>{room.name}</h4>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center mb-4">
                              <MapPin size={12} className="mr-1"/> {room.location}
                            </p>
                            
                            {/* 简要状态展示 */}
                            <div className="mt-auto pt-3 border-t border-gray-50">
                               {status.isSchedule ? (
                                 <div className="text-xs text-indigo-600 font-medium truncate">
                                   <Clock size={12} className="inline mr-1"/>
                                   {status.title}
                                 </div>
                               ) : (
                                 <div className="text-xs text-gray-400">
                                   暂无安排
                                 </div>
                               )}
                               <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 font-mono">
                                 <Cpu size={10} /> SN: {room.deviceSn || '未绑定'}
                               </div>
                            </div>
                         </div>
                      </div>
                    );
                  })}
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  // --- 详情模式 ---
  
  const activeRoom = rooms.find((r: any) => r.id === selectedRoomId);
  const activeRoomStatus = getRoomStatus(activeRoom);
  const selectedRoomSchedules = schedules
    .filter((s: any) => s.roomId === selectedRoomId)
    .sort((a: any, b: any) => a.startTime - b.startTime);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 左侧：快速切换列表 */}
      <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <button 
             onClick={() => setSelectedRoomId(null)}
             className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
          >
             <Grid size={16} /> 返回概览
          </button>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">同层房间</div>
          <ul>
            {rooms.filter((r: any) => getFloor(r.location) === getFloor(activeRoom.location)).map((room: any) => (
              <li key={room.id} className="mb-1">
                <button
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm flex items-center justify-between ${
                    selectedRoomId === room.id 
                      ? 'bg-indigo-50 text-indigo-700 font-medium' 
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="truncate">{room.name}</span>
                  {room.id === selectedRoomId && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* 右侧：详情与设置 */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* 顶部标题区 */}
          <div className="flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-bold text-gray-900">{activeRoom.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                   <span className="flex items-center gap-1"><MapPin size={14}/> {activeRoom.location}</span>
                   <span className="flex items-center gap-1 font-mono bg-gray-100 px-2 py-0.5 rounded text-xs"><Cpu size={12}/> {activeRoom.deviceSn}</span>
                </div>
             </div>
             <div className="bg-white border border-yellow-200 rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm">
                <Clock className="text-yellow-600" size={16} />
                <div className="text-xs">
                  <div className="font-bold text-yellow-800">时间调试</div>
                  <div className="text-yellow-600/80">{new Date(simulatedTime).toLocaleTimeString()}</div>
                </div>
                <input 
                   type="range" min="-86400000" max="86400000" step="3600000" 
                   value={timeOffset}
                   onChange={(e) => setTimeOffset(Number(e.target.value))}
                   className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* 左栏：实时状态与日程 */}
             <div className="lg:col-span-2 space-y-6">
                
                {/* 1. 实时预览 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2"><Monitor size={16}/> 终端实时画面预览</h3>
                      <StatusBadge status={activeRoomStatus.status} />
                   </div>
                   <div className="relative rounded-lg overflow-hidden border border-gray-100 aspect-video group">
                      <img src={activeRoomStatus.bg} className="w-full h-full object-cover brightness-75" alt="preview" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                         <div className="text-2xl font-bold mb-1 drop-shadow-md">{activeRoomStatus.title}</div>
                         <div className="text-sm opacity-90 drop-shadow-md">{activeRoomStatus.subtitle}</div>
                      </div>
                      <div className="absolute bottom-2 right-2 text-[10px] text-white/50 font-mono">LIVE PREVIEW</div>
                   </div>
                </div>

                {/* 2. 日程列表 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar size={16}/> 日程排期</h3>
                    <button 
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> 新增
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {selectedRoomSchedules.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">暂无预设日程，显示默认信息</div>
                    ) : (
                      selectedRoomSchedules.map((schedule: any) => {
                         const isCurrent = schedule.startTime <= simulatedTime && schedule.endTime >= simulatedTime;
                         const isPast = schedule.endTime < simulatedTime;
                         return (
                          <div key={schedule.id} className={`p-4 flex items-center justify-between ${isPast ? 'opacity-50 bg-gray-50' : ''}`}>
                            <div className="flex items-center gap-3">
                              <div className={`text-xs font-mono text-gray-500 w-24`}>
                                <div>{new Date(schedule.startTime).getHours()}:00</div>
                                <div className="text-gray-300">|</div>
                                <div>{new Date(schedule.endTime).getHours()}:00</div>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                   {schedule.title}
                                   {isCurrent && <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded">NOW</span>}
                                </div>
                                <div className="text-xs text-gray-500">{schedule.owner}</div>
                              </div>
                            </div>
                            <StatusBadge status={schedule.status} size="sm" />
                          </div>
                         );
                      })
                    )}
                  </div>
                </div>
             </div>

             {/* 右栏：房间与设备配置 */}
             <div className="lg:col-span-1">
                <RoomSettingsPanel room={activeRoom} onUpdate={onUpdateRoom} />
             </div>
          </div>
        </div>
      </div>

      {isScheduleModalOpen && (
        <ScheduleModal 
          onClose={() => setIsScheduleModalOpen(false)} 
          onSubmit={(data: any) => {
            // 处理提交逻辑
            const start = new Date().setHours(data.startHour, 0, 0, 0);
            const end = new Date(start).setHours(data.startHour + data.duration, 0, 0, 0);
            onAddSchedule({
              roomId: selectedRoomId,
              title: data.title,
              owner: data.owner,
              status: data.status,
              startTime: start,
              endTime: end,
              bgImage: null
            });
            setIsScheduleModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// --- 子组件：房间设置面板 (更新：支持图片上传与预设选择) ---

function RoomSettingsPanel({ room, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...room });

  useEffect(() => {
    setFormData({ ...room });
  }, [room]);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 在实际项目中，这里应该将文件上传到服务器并获取 URL
      // 这里使用 createObjectURL 模拟本地预览
      const objectUrl = URL.createObjectURL(file);
      setFormData({ ...formData, defaultBg: objectUrl });
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
         <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Settings size={16}/> 房间与设备配置</h3>
            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-indigo-600 transition-colors">
               <Edit3 size={16} />
            </button>
         </div>
         
         <div className="space-y-4">
            <div>
               <label className="text-xs font-semibold text-gray-400 uppercase">房间名称</label>
               <div className="text-gray-900 font-medium">{room.name}</div>
            </div>
            <div>
               <label className="text-xs font-semibold text-gray-400 uppercase">物理位置</label>
               <div className="text-gray-900">{room.location}</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
               <label className="text-xs font-semibold text-indigo-400 uppercase flex items-center gap-1"><Cpu size={10}/> 绑定设备 SN</label>
               <div className="text-indigo-900 font-mono font-medium mt-1 select-all">{room.deviceSn}</div>
            </div>
            <div>
               <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">默认背景图</label>
               <img src={room.defaultBg} alt="def-bg" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-5 space-y-4 ring-2 ring-indigo-50">
       <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="font-bold text-indigo-700 flex items-center gap-2">编辑配置</h3>
       </div>
       
       <div className="space-y-3">
          <div>
             <label className="block text-xs font-medium text-gray-700 mb-1">房间名称</label>
             <input 
               value={formData.name} 
               onChange={(e) => setFormData({...formData, name: e.target.value})}
               className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
             />
          </div>
          <div>
             <label className="block text-xs font-medium text-gray-700 mb-1">物理位置</label>
             <input 
               value={formData.location} 
               onChange={(e) => setFormData({...formData, location: e.target.value})}
               className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
             />
          </div>
          <div>
             <label className="block text-xs font-medium text-gray-700 mb-1">设备 SN 码</label>
             <input 
               value={formData.deviceSn} 
               onChange={(e) => setFormData({...formData, deviceSn: e.target.value})}
               className="w-full text-sm font-mono border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-yellow-50" 
             />
          </div>
          
          {/* 背景选择区域 */}
          <div>
             <label className="block text-xs font-medium text-gray-700 mb-2">默认背景设置</label>
             
             {/* 预览区域 */}
             <div className="mb-3 relative group rounded-lg overflow-hidden bg-gray-100">
                <img src={formData.defaultBg} alt="preview" className="w-full h-32 object-cover border border-gray-200" />
                <div className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-2 py-1 rounded backdrop-blur-sm">当前预览</div>
             </div>

             <div className="space-y-3">
                {/* 预设图库 */}
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold mb-2 flex items-center justify-between">
                    <span>系统预设图库</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_BACKGROUNDS.map((bg, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setFormData({...formData, defaultBg: bg})}
                        className={`relative rounded-md overflow-hidden aspect-video border-2 transition-all ${formData.defaultBg === bg ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-gray-300'}`}
                      >
                        <img src={bg} className="w-full h-full object-cover" alt={`preset-${idx}`} />
                        {formData.defaultBg === bg && (
                          <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center backdrop-blur-[1px]">
                            <Check size={16} className="text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 上传区域 */}
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold mb-2">或上传自定义图片</div>
                  <label className="flex flex-col items-center justify-center w-full h-12 px-4 transition bg-white border border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30">
                      <span className="flex items-center space-x-2 text-gray-500 text-xs">
                          <Upload size={14} />
                          <span className="font-medium">点击选择本地文件</span>
                      </span>
                      <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                </div>
             </div>
          </div>
       </div>

       <div className="flex gap-2 pt-2">
          <button onClick={() => setIsEditing(false)} className="flex-1 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded">取消</button>
          <button onClick={handleSave} className="flex-1 px-3 py-2 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center justify-center gap-1">
             <Save size={12} /> 保存配置
          </button>
       </div>
    </div>
  );
}

// --- 简单的日程添加弹窗 (提取组件) ---

function ScheduleModal({ onClose, onSubmit }: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSubmit({
      title: formData.get('title'),
      owner: formData.get('owner'),
      startHour: parseInt(formData.get('startHour') as string),
      duration: parseInt(formData.get('duration') as string),
      status: formData.get('status')
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-96 animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold mb-4">添加临时日程</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">显示主标题</label>
            <input name="title" required placeholder="例如：部门周会" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">使用人/副标题</label>
            <input name="owner" placeholder="例如：技术部" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始时间 (小时)</label>
                <select name="startHour" className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                  {Array.from({length: 24}).map((_, i) => (
                    <option key={i} value={i}>{i}:00</option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">时长 (小时)</label>
                <input name="duration" type="number" defaultValue={1} min={1} max={8} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">显示状态</label>
            <select name="status" className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="busy">使用中 (红色)</option>
              <option value="dnd">请勿打扰/不开放 (灰色)</option>
              <option value="free">空闲/可参观 (绿色)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">取消</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 门牌模拟器 (添加了简单的切换逻辑方便演示) ---

function DeviceSimulator({ room, statusData, currentTime, allRooms, onSelectRoom }: any) {
  const THEMES: any = {
    free: { color: 'bg-emerald-500', text: 'text-emerald-500', label: '空闲中 · IDLE', icon: CheckCircle },
    busy: { color: 'bg-rose-600', text: 'text-rose-600', label: '使用中 · IN USE', icon: AlertCircle },
    dnd:  { color: 'bg-slate-600', text: 'text-slate-600', label: '不开放 · CLOSED', icon: XCircle }
  };

  const theme = THEMES[statusData?.status] || THEMES.free;
  const StatusIcon = theme.icon;

  if (!room) return <div className="text-white">请选择一个房间</div>;

  return (
    <div className="flex-1 bg-gray-900 flex flex-col items-center justify-center p-8 overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
      
      {/* 顶部模拟器控制栏 */}
      <div className="absolute top-4 left-0 w-full flex justify-center z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-3 text-white text-sm border border-white/20">
          <span className="opacity-70">正在预览:</span>
          <select 
            value={room.id} 
            onChange={(e) => onSelectRoom(Number(e.target.value))}
            className="bg-transparent border-b border-white/30 text-white font-bold outline-none focus:border-white option:text-black"
          >
            {allRooms.map((r: any) => <option key={r.id} value={r.id} className="text-black">{r.name}</option>)}
          </select>
          <span className="font-mono text-xs opacity-50 px-2 border-l border-white/20">SN: {room.deviceSn}</span>
        </div>
      </div>

      {/* 模拟硬件边框 */}
      <div className="relative bg-black rounded-[32px] p-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-gray-800 ring-2 ring-gray-700" 
           style={{ width: '100%', maxWidth: '960px', aspectRatio: '16/10' }}>
        
        {/* 屏幕显示区域 */}
        <div className="w-full h-full rounded-2xl overflow-hidden relative bg-gray-800 text-white flex flex-col">
          
          {/* 背景层 */}
          <div className="absolute inset-0 z-0">
             <img 
               src={statusData.bg} 
               alt="Background" 
               className="w-full h-full object-cover transition-all duration-1000 ease-in-out transform scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          </div>

          {/* 顶部状态栏 */}
          <div className="relative z-10 flex justify-between items-start p-8">
             <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <div className="w-6 h-6 bg-white/20 rounded-md"></div>
                  <span className="text-sm font-medium tracking-widest text-white/80">CORPORATE SPACE</span>
                </div>
                <h2 className="text-3xl font-light text-white opacity-90">{room.name}</h2>
                <div className="text-sm text-white/60 flex items-center mt-1">
                   <MapPin size={14} className="mr-1"/> {room.location}
                </div>
             </div>
             
             <div className="text-right">
                <div className="text-6xl font-thin tracking-tighter font-mono">{formatTime(new Date(currentTime))}</div>
                <div className="text-lg text-white/80 font-light mt-1">{formatDate(new Date(currentTime))}</div>
             </div>
          </div>

          {/* 中间动态内容区 */}
          <div className="relative z-10 flex-1 flex flex-col justify-center px-12">
             <div className="backdrop-blur-md bg-white/10 border border-white/10 p-8 rounded-2xl max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
               {statusData.isSchedule ? (
                 <>
                   <div className="flex items-center gap-3 text-white/70 mb-2 text-lg">
                      <span className="bg-white/20 px-2 py-0.5 rounded text-sm">Current Meeting</span>
                      <span>{statusData.subtitle}</span>
                   </div>
                   <h1 className="text-5xl font-bold leading-tight drop-shadow-lg mb-4 line-clamp-2">
                     {statusData.title}
                   </h1>
                   <div className="flex items-center gap-4 text-white/80">
                      <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg">
                        <Clock size={18} />
                        <span className="font-mono text-xl">
                           {formatTime(new Date(currentTime))} - {formatTime(new Date(statusData.endTime))}
                        </span>
                      </div>
                   </div>
                 </>
               ) : (
                 <>
                   <h1 className="text-5xl font-bold leading-tight drop-shadow-lg mb-2">
                     {room.name}
                   </h1>
                   <p className="text-2xl text-white/70 font-light">当前暂无安排，欢迎使用</p>
                 </>
               )}
             </div>
          </div>

          {/* 底部状态条 */}
          <div className={`relative z-10 h-20 ${theme.color} flex items-center justify-between px-8 transition-colors duration-500`}>
             <div className="flex items-center gap-3 text-white font-bold text-xl tracking-widest">
                <StatusIcon className="animate-pulse" />
                {theme.label}
             </div>
             
             <div className="flex-1 mx-12 overflow-hidden relative h-full flex items-center">
                <div className="whitespace-nowrap text-white/90 text-sm animate-marquee">
                   温馨提示：最后一位离开办公室的同事请务必关灯、锁门。本楼层消防通道位于电梯左侧。
                </div>
             </div>

             <div className="flex items-center gap-2 text-white/60 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Online
             </div>
          </div>
        </div>
        
        {/* 模拟摄像头 */}
        <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
      </div>
      
      <style>{`
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status, size = 'md' }: any) {
  const styles: any = {
    free: "bg-green-100 text-green-700 border-green-200",
    busy: "bg-red-100 text-red-700 border-red-200",
    dnd: "bg-gray-100 text-gray-700 border-gray-200"
  };
  
  const labels: any = {
    free: "空闲",
    busy: "使用中",
    dnd: "不开放"
  };

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`border rounded-full font-medium ${styles[status] || styles.free} ${px}`}>
      {labels[status] || labels.free}
    </span>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
