import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  Edit2,
  Trash2,
  X,
  FileText,
  CheckSquare,
} from 'lucide-react';
import {
  useMeetingsByProject,
  useCreateMeeting,
  useUpdateMeeting,
  useStartMeeting,
  useCompleteMeeting,
  useCancelMeeting,
  useDeleteMeeting,
} from '../../src/hooks/useApi';

interface ProjectMeetingsProps {
  projectId: string;
  canEdit?: boolean;
}

interface MeetingFormData {
  title: string;
  description: string;
  meetingType: 'kickoff' | 'status_update' | 'review' | 'planning' | 'retrospective' | 'other';
  scheduledAt: string;
  durationMinutes: number;
  location: string;
  meetingUrl: string;
  attendees: string[];
  notes: string;
}

const ProjectMeetings: React.FC<ProjectMeetingsProps> = ({ projectId, canEdit = false }) => {
  const { data: meetings, isLoading, error } = useMeetingsByProject(projectId);
  const createMutation = useCreateMeeting();
  const updateMutation = useUpdateMeeting();
  const startMutation = useStartMeeting();
  const completeMutation = useCompleteMeeting();
  const cancelMutation = useCancelMeeting();
  const deleteMutation = useDeleteMeeting();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [showMeetingDetail, setShowMeetingDetail] = useState(false);
  const [attendeeInput, setAttendeeInput] = useState('');

  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    meetingType: 'status_update',
    scheduledAt: '',
    durationMinutes: 60,
    location: '',
    meetingUrl: '',
    attendees: [],
    notes: '',
  });

  // Calendar logic
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());

  const calendarDays = useMemo(() => {
    const days = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const getMeetingsForDay = (date: Date) => {
    if (!meetings) return [];
    return meetings.filter((meeting: any) => {
      const meetingDate = new Date(meeting.scheduledAt);
      return (
        meetingDate.getDate() === date.getDate() &&
        meetingDate.getMonth() === date.getMonth() &&
        meetingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getMeetingTypeInfo = (type: string) => {
    const types: Record<string, { label: string; color: string; bg: string }> = {
      kickoff: { label: 'Kickoff', color: 'text-purple-700', bg: 'bg-purple-100 border-purple-300' },
      status_update: { label: 'Status', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-300' },
      review: { label: 'Review', color: 'text-green-700', bg: 'bg-green-100 border-green-300' },
      planning: { label: 'Planering', color: 'text-orange-700', bg: 'bg-orange-100 border-orange-300' },
      retrospective: { label: 'Retro', color: 'text-pink-700', bg: 'bg-pink-100 border-pink-300' },
      other: { label: 'Övrigt', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-300' },
    };
    return types[type] || types.other;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      scheduled: { label: 'Schemalagd', color: 'bg-blue-100 text-blue-700' },
      in_progress: { label: 'Pågår', color: 'bg-green-100 text-green-700' },
      completed: { label: 'Avslutad', color: 'bg-slate-100 text-slate-700' },
      cancelled: { label: 'Inställd', color: 'bg-red-100 text-red-700' },
    };
    return badges[status] || badges.scheduled;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const openCreateModal = (date?: Date) => {
    const selectedDateTime = date || new Date();
    selectedDateTime.setHours(10, 0, 0, 0);

    setSelectedDate(selectedDateTime);
    setFormData({
      title: '',
      description: '',
      meetingType: 'status_update',
      scheduledAt: selectedDateTime.toISOString().slice(0, 16),
      durationMinutes: 60,
      location: '',
      meetingUrl: '',
      attendees: [],
      notes: '',
    });
    setShowCreateModal(true);
  };

  const openEditModal = (meeting: any) => {
    setSelectedMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      meetingType: meeting.meetingType,
      scheduledAt: new Date(meeting.scheduledAt).toISOString().slice(0, 16),
      durationMinutes: meeting.durationMinutes,
      location: meeting.location || '',
      meetingUrl: meeting.meetingUrl || '',
      attendees: meeting.attendees || [],
      notes: meeting.notes || '',
    });
    setShowMeetingDetail(false);
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.scheduledAt) {
      alert('Titel och tid är obligatoriska');
      return;
    }

    try {
      await createMutation.mutateAsync({
        projectId,
        title: formData.title,
        description: formData.description || undefined,
        meetingType: formData.meetingType,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        durationMinutes: formData.durationMinutes,
        location: formData.location || undefined,
        meetingUrl: formData.meetingUrl || undefined,
        attendees: formData.attendees.length > 0 ? formData.attendees : undefined,
        notes: formData.notes || undefined,
        status: 'scheduled',
      });
      setShowCreateModal(false);
      setSelectedMeeting(null);
    } catch (err) {
      console.error('Failed to create meeting:', err);
      alert('Misslyckades att skapa möte');
    }
  };

  const handleUpdate = async () => {
    if (!selectedMeeting || !formData.title || !formData.scheduledAt) {
      alert('Titel och tid är obligatoriska');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedMeeting.id,
        projectId,
        title: formData.title,
        description: formData.description || undefined,
        meetingType: formData.meetingType,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        durationMinutes: formData.durationMinutes,
        location: formData.location || undefined,
        meetingUrl: formData.meetingUrl || undefined,
        attendees: formData.attendees.length > 0 ? formData.attendees : undefined,
        notes: formData.notes || undefined,
      });
      setShowCreateModal(false);
      setSelectedMeeting(null);
    } catch (err) {
      console.error('Failed to update meeting:', err);
      alert('Misslyckades att uppdatera möte');
    }
  };

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta möte?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: meetingId, projectId });
      setShowMeetingDetail(false);
    } catch (err) {
      console.error('Failed to delete meeting:', err);
      alert('Misslyckades att ta bort möte');
    }
  };

  const handleStartMeeting = async (meetingId: string) => {
    try {
      await startMutation.mutateAsync({ id: meetingId, projectId });
    } catch (err) {
      console.error('Failed to start meeting:', err);
      alert('Misslyckades att starta möte');
    }
  };

  const handleCompleteMeeting = async (meetingId: string) => {
    try {
      await completeMutation.mutateAsync({
        id: meetingId,
        projectId,
        notes: formData.notes || undefined,
      });
      setShowMeetingDetail(false);
    } catch (err) {
      console.error('Failed to complete meeting:', err);
      alert('Misslyckades att avsluta möte');
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    if (!confirm('Är du säker på att du vill ställa in detta möte?')) {
      return;
    }

    try {
      await cancelMutation.mutateAsync({ id: meetingId, projectId });
      setShowMeetingDetail(false);
    } catch (err) {
      console.error('Failed to cancel meeting:', err);
      alert('Misslyckades att ställa in möte');
    }
  };

  const addAttendee = () => {
    if (attendeeInput.trim()) {
      setFormData({
        ...formData,
        attendees: [...formData.attendees, attendeeInput.trim()],
      });
      setAttendeeInput('');
    }
  };

  const removeAttendee = (index: number) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error.message || 'Ett fel uppstod vid laddning av möten'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif text-slate-900 mb-2">Möten</h3>
          <p className="text-slate-600">Schemalägg och hantera projektmöten</p>
        </div>
        {canEdit && (
          <button
            onClick={() => openCreateModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nytt möte</span>
          </button>
        )}
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-semibold text-slate-900">
              {currentDate.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}
            </h4>
            <button
              onClick={today}
              className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Idag
            </button>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          {/* Weekday headers */}
          {['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'].map((day) => (
            <div
              key={day}
              className="bg-slate-50 px-2 py-3 text-center text-xs font-semibold text-slate-600"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday =
              day.getDate() === new Date().getDate() &&
              day.getMonth() === new Date().getMonth() &&
              day.getFullYear() === new Date().getFullYear();
            const dayMeetings = getMeetingsForDay(day);

            return (
              <div
                key={index}
                className={`bg-white min-h-24 p-2 ${
                  !isCurrentMonth ? 'opacity-40' : ''
                } ${canEdit ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                onClick={() => canEdit && openCreateModal(day)}
              >
                <div
                  className={`text-sm mb-1 ${
                    isToday
                      ? 'w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold'
                      : 'text-slate-700'
                  }`}
                >
                  {day.getDate()}
                </div>

                {/* Meetings for this day */}
                <div className="space-y-1">
                  {dayMeetings.slice(0, 2).map((meeting: any) => {
                    const typeInfo = getMeetingTypeInfo(meeting.meetingType);
                    return (
                      <div
                        key={meeting.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMeeting(meeting);
                          setShowMeetingDetail(true);
                        }}
                        className={`text-xs p-1 rounded border ${typeInfo.bg} ${typeInfo.color} truncate cursor-pointer hover:shadow-sm transition-shadow`}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(meeting.scheduledAt).toLocaleTimeString('sv-SE', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            {meeting.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {dayMeetings.length > 2 && (
                    <div className="text-xs text-slate-500 pl-1">+{dayMeetings.length - 2} fler</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-serif text-slate-900">
                {selectedMeeting ? 'Redigera möte' : 'Skapa nytt möte'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedMeeting(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Titel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="t.ex. Veckomöte"
                />
              </div>

              {/* Meeting Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Typ av möte</label>
                <select
                  value={formData.meetingType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      meetingType: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="kickoff">Kickoff</option>
                  <option value="status_update">Statusuppdatering</option>
                  <option value="review">Review</option>
                  <option value="planning">Planering</option>
                  <option value="retrospective">Retrospektiv</option>
                  <option value="other">Övrigt</option>
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Datum & Tid <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Längd (minuter)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Beskrivning</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Agenda och syfte med mötet"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Plats</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="t.ex. Kontor, Rum A1"
                  />
                </div>
              </div>

              {/* Meeting URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mötes-länk</label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={formData.meetingUrl}
                    onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="https://zoom.us/... eller Google Meet-länk"
                  />
                </div>
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Deltagare</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Namn eller email"
                  />
                  <button
                    onClick={addAttendee}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Lägg till
                  </button>
                </div>
                {formData.attendees.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.attendees.map((attendee, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        <Users className="w-3 h-3" />
                        <span>{attendee}</span>
                        <button
                          onClick={() => removeAttendee(index)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes (if editing) */}
              {selectedMeeting && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Anteckningar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Anteckningar från mötet"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedMeeting(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={selectedMeeting ? handleUpdate : handleCreate}
                disabled={
                  createMutation.isPending || updateMutation.isPending || !formData.title || !formData.scheduledAt
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Sparar...'
                  : selectedMeeting
                  ? 'Uppdatera'
                  : 'Skapa möte'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {showMeetingDetail && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-serif text-slate-900">{selectedMeeting.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getStatusBadge(selectedMeeting.status).color
                      }`}
                    >
                      {getStatusBadge(selectedMeeting.status).label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        getMeetingTypeInfo(selectedMeeting.meetingType).bg
                      } ${getMeetingTypeInfo(selectedMeeting.meetingType).color}`}
                    >
                      {getMeetingTypeInfo(selectedMeeting.meetingType).label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowMeetingDetail(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Actions */}
              {canEdit && selectedMeeting.status !== 'cancelled' && (
                <div className="flex gap-2 flex-wrap">
                  {selectedMeeting.status === 'scheduled' && (
                    <button
                      onClick={() => handleStartMeeting(selectedMeeting.id)}
                      disabled={startMutation.isPending}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Starta möte
                    </button>
                  )}
                  {(selectedMeeting.status === 'scheduled' || selectedMeeting.status === 'in_progress') && (
                    <button
                      onClick={() => handleCompleteMeeting(selectedMeeting.id)}
                      disabled={completeMutation.isPending}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Avsluta möte
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(selectedMeeting)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Redigera
                  </button>
                  <button
                    onClick={() => handleCancelMeeting(selectedMeeting.id)}
                    disabled={cancelMutation.isPending}
                    className="px-3 py-1.5 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Ställ in
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMeeting.id)}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-1.5 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    Ta bort
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-900">
                    {new Date(selectedMeeting.scheduledAt).toLocaleDateString('sv-SE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-sm text-slate-600">
                    {new Date(selectedMeeting.scheduledAt).toLocaleTimeString('sv-SE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    ({selectedMeeting.durationMinutes} min)
                  </div>
                </div>
              </div>

              {/* Location */}
              {selectedMeeting.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div className="text-slate-700">{selectedMeeting.location}</div>
                </div>
              )}

              {/* Meeting URL */}
              {selectedMeeting.meetingUrl && (
                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-slate-400 mt-0.5" />
                  <a
                    href={selectedMeeting.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {selectedMeeting.meetingUrl}
                  </a>
                </div>
              )}

              {/* Description */}
              {selectedMeeting.description && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div className="text-slate-700 whitespace-pre-wrap">{selectedMeeting.description}</div>
                </div>
              )}

              {/* Attendees */}
              {selectedMeeting.attendees && selectedMeeting.attendees.length > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div className="flex flex-wrap gap-2">
                    {selectedMeeting.attendees.map((attendee: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                      >
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedMeeting.notes && (
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <h4 className="font-medium text-slate-900">Anteckningar</h4>
                  </div>
                  <div className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                    {selectedMeeting.notes}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {selectedMeeting.actionItems && Object.keys(selectedMeeting.actionItems).length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="w-4 h-4 text-slate-400" />
                    <h4 className="font-medium text-slate-900">Action Items</h4>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(selectedMeeting.actionItems).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                        <div className="text-slate-700">
                          <strong>{key}:</strong> {String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMeetings;
