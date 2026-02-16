import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  Trash2,
  Edit,
  X,
  Check,
} from 'lucide-react';
import api from '@/lib/api';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Appointment {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  type: 'meeting' | 'call' | 'video_call' | 'other';
  attendees?: string[];
  allDay?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const TYPE_CONFIG: Record<
  Appointment['type'],
  { label: string; color: string; dotColor: string; icon: typeof CalendarIcon }
> = {
  meeting: {
    label: 'Meeting',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dotColor: 'bg-blue-500',
    icon: Users,
  },
  call: {
    label: 'Call',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dotColor: 'bg-green-500',
    icon: Phone,
  },
  video_call: {
    label: 'Video Call',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    dotColor: 'bg-purple-500',
    icon: Video,
  },
  other: {
    label: 'Other',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    dotColor: 'bg-gray-500',
    icon: CalendarIcon,
  },
};

// ── Main Component ─────────────────────────────────────────────────────────────

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Calculate the date range visible on the calendar (includes overflow days)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('startDate', format(calendarStart, 'yyyy-MM-dd'));
      params.set('endDate', format(calendarEnd, 'yyyy-MM-dd'));
      params.set('limit', '200');
      const { data } = await api.get(`/appointments?${params}`);
      return data.data;
    },
  });

  const appointments: Appointment[] = data?.appointments || [];

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (appointment: any) =>
      editingAppointment
        ? api.put(`/appointments/${editingAppointment.id}`, appointment)
        : api.post('/appointments', appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(editingAppointment ? 'Appointment updated' : 'Appointment created');
      setShowForm(false);
      setEditingAppointment(null);
    },
    onError: () => {
      toast.error(editingAppointment ? 'Failed to update appointment' : 'Failed to create appointment');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment deleted');
      setShowDeleteConfirm(null);
    },
    onError: () => {
      toast.error('Failed to delete appointment');
    },
  });

  // ── Calendar grid computation ──────────────────────────────────────────────

  const calendarDays = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart.getTime(), calendarEnd.getTime()]
  );

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      const dateKey = format(parseISO(apt.startDate), 'yyyy-MM-dd');
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(apt);
    });
    // Sort appointments within each day by start time
    map.forEach((apts) => {
      apts.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    });
    return map;
  }, [appointments]);

  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return appointmentsByDate.get(dateKey) || [];
  }, [selectedDate, appointmentsByDate]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handlePrevMonth = useCallback(() => setCurrentMonth((m) => subMonths(m, 1)), []);
  const handleNextMonth = useCallback(() => setCurrentMonth((m) => addMonths(m, 1)), []);
  const handleToday = useCallback(() => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  }, []);

  const handleDayClick = useCallback((day: Date) => {
    setSelectedDate((prev) => (prev && isSameDay(prev, day) ? prev : day));
  }, []);

  const openCreateForm = useCallback(
    (date?: Date) => {
      setEditingAppointment(null);
      if (date) setSelectedDate(date);
      setShowForm(true);
    },
    []
  );

  const openEditForm = useCallback((appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const allDay = fd.get('allDay') === 'on';
    const attendeesRaw = (fd.get('attendees') as string) || '';
    const attendees = attendeesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let startDate: string;
    let endDate: string;

    if (allDay) {
      startDate = `${fd.get('startDate')}T00:00:00.000Z`;
      endDate = `${fd.get('endDate') || fd.get('startDate')}T23:59:59.000Z`;
    } else {
      startDate = `${fd.get('startDate')}T${fd.get('startTime') || '09:00'}:00.000Z`;
      endDate = `${fd.get('endDate') || fd.get('startDate')}T${fd.get('endTime') || '10:00'}:00.000Z`;
    }

    createMutation.mutate({
      title: fd.get('title'),
      description: fd.get('description') || undefined,
      startDate,
      endDate,
      location: fd.get('location') || undefined,
      type: fd.get('type') || 'meeting',
      attendees: attendees.length > 0 ? attendees : undefined,
      allDay,
    });
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const getTypeConfig = (type: Appointment['type']) =>
    TYPE_CONFIG[type] || TYPE_CONFIG.other;

  const formatTime = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'h:mm a');
    } catch {
      return '';
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Calendar</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            {data?.total ?? 0} appointments this month
          </p>
        </div>
        <button
          onClick={() => openCreateForm(selectedDate || new Date())}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-medium shadow-md shadow-indigo-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> New Appointment
        </button>
      </div>

      {/* Calendar + Side Panel */}
      <div className="flex gap-6 items-start">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-4">
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-[11px] font-semibold rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/60 transition-all"
              >
                Today
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] transition-all"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] transition-all"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-[var(--border-color)]">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          {isLoading ? (
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[100px] p-2 border-b border-r border-[var(--border-color)]"
                >
                  <div className="skeleton h-5 w-5 rounded-full mb-2" />
                  <div className="space-y-1">
                    <div className="skeleton h-3 w-3/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calendarDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayAppointments = appointmentsByDate.get(dateKey) || [];
                const inCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const today = isToday(day);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      'min-h-[100px] p-2 border-b border-r border-[var(--border-color)] text-left transition-all relative group',
                      inCurrentMonth
                        ? 'bg-transparent'
                        : 'bg-[var(--bg-secondary)]/30',
                      isSelected && 'ring-2 ring-inset ring-indigo-500',
                      !isSelected && 'hover:bg-[var(--bg-secondary)]/60'
                    )}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-medium transition-colors',
                          today && 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20',
                          !today && inCurrentMonth && 'text-[var(--text-primary)]',
                          !today && !inCurrentMonth && 'text-[var(--text-tertiary)]'
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayAppointments.length > 0 && (
                        <span className="text-[10px] font-semibold text-[var(--text-tertiary)]">
                          {dayAppointments.length}
                        </span>
                      )}
                    </div>

                    {/* Appointment Chips */}
                    <div className="space-y-0.5">
                      {dayAppointments.slice(0, 3).map((apt) => {
                        const config = getTypeConfig(apt.type);
                        return (
                          <div
                            key={apt.id}
                            className={cn(
                              'flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] leading-tight truncate',
                              config.color
                            )}
                            title={apt.title}
                          >
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                                config.dotColor
                              )}
                            />
                            <span className="truncate font-semibold">{apt.title}</span>
                          </div>
                        );
                      })}
                      {dayAppointments.length > 3 && (
                        <div className="text-[10px] font-semibold text-[var(--text-tertiary)] px-1.5">
                          +{dayAppointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 px-6 py-3 border-t border-[var(--border-color)]">
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={cn('w-2 h-2 rounded-full', config.dotColor)} />
                <span className="text-[11px] text-[var(--text-tertiary)]">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel: Selected Day Detail */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl overflow-hidden sticky top-6">
            {/* Panel Header */}
            <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">
                  {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a day'}
                </h3>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  {selectedDate
                    ? `${selectedDateAppointments.length} appointment${selectedDateAppointments.length !== 1 ? 's' : ''}`
                    : 'Click a day to view details'}
                </p>
              </div>
              {selectedDate && (
                <button
                  onClick={() => openCreateForm(selectedDate)}
                  className="p-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-500/20 transition-all"
                  title="Add appointment"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Panel Content */}
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
              {!selectedDate ? (
                <div className="px-5 py-12 text-center">
                  <CalendarIcon className="w-10 h-10 mx-auto text-[var(--text-tertiary)] mb-3 opacity-50" />
                  <p className="text-[13px] text-[var(--text-tertiary)]">
                    Select a day on the calendar to view its appointments
                  </p>
                </div>
              ) : selectedDateAppointments.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <CalendarIcon className="w-10 h-10 mx-auto text-[var(--text-tertiary)] mb-3 opacity-50" />
                  <p className="text-[13px] text-[var(--text-tertiary)] mb-3">
                    No appointments scheduled
                  </p>
                  <button
                    onClick={() => openCreateForm(selectedDate)}
                    className="text-[13px] font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                  >
                    + Add one
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-color)]">
                  {selectedDateAppointments.map((apt) => {
                    const config = getTypeConfig(apt.type);
                    const TypeIcon = config.icon;
                    const isDeleting = showDeleteConfirm === apt.id;

                    return (
                      <div
                        key={apt.id}
                        className="px-5 py-4 hover:bg-[var(--bg-secondary)]/60 transition-all group relative"
                      >
                        {/* Delete Confirmation Overlay */}
                        {isDeleting && (
                          <div className="absolute inset-0 bg-white/90 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center gap-2 z-10 px-4 rounded-xl">
                            <span className="text-[13px] text-[var(--text-secondary)]">Delete?</span>
                            <button
                              onClick={() => deleteMutation.mutate(apt.id)}
                              disabled={deleteMutation.isPending}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold rounded-xl transition-all disabled:opacity-50"
                            >
                              {deleteMutation.isPending ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-3 py-1.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] text-[11px] font-semibold rounded-xl hover:bg-[var(--bg-secondary)] transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Appointment Card */}
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                              config.color
                            )}
                          >
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight">
                                {apt.title}
                              </h4>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditForm(apt);
                                  }}
                                  className="p-1 rounded-lg hover:bg-[var(--bg-secondary)]/60 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all"
                                  title="Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(apt.id);
                                  }}
                                  className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--text-tertiary)] hover:text-red-600 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Type Badge */}
                            <span
                              className={cn(
                                'inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold mt-1',
                                config.color
                              )}
                            >
                              {config.label}
                            </span>

                            {/* Time */}
                            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[var(--text-secondary)]">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              {apt.allDay ? (
                                <span>All day</span>
                              ) : (
                                <span>
                                  {formatTime(apt.startDate)} &ndash; {formatTime(apt.endDate)}
                                </span>
                              )}
                            </div>

                            {/* Location */}
                            {apt.location && (
                              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--text-secondary)]">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{apt.location}</span>
                              </div>
                            )}

                            {/* Attendees */}
                            {apt.attendees && apt.attendees.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--text-secondary)]">
                                <Users className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                  {apt.attendees.length} attendee{apt.attendees.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            )}

                            {/* Description */}
                            {apt.description && (
                              <p className="mt-2 text-[11px] text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
                                {apt.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl w-full max-w-lg mx-4 animate-fadeInScale shadow-2xl shadow-black/10 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAppointment(null);
                }}
                className="p-2 rounded-xl hover:bg-[var(--bg-secondary)]/60 text-[var(--text-tertiary)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                    Title *
                  </label>
                  <input
                    name="title"
                    defaultValue={editingAppointment?.title}
                    required
                    placeholder="e.g., Client check-in call"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingAppointment?.description}
                    placeholder="Add notes or agenda items..."
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                </div>

                {/* Type + All Day */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                      Type
                    </label>
                    <select
                      name="type"
                      defaultValue={editingAppointment?.type || 'meeting'}
                      className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="call">Call</option>
                      <option value="video_call">Video Call</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="allDay"
                        defaultChecked={editingAppointment?.allDay}
                        className="w-4 h-4 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                      />
                      <span className="text-[13px] font-medium text-[var(--text-secondary)]">
                        All day event
                      </span>
                    </label>
                  </div>
                </div>

                {/* Start Date + Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                      Start Date *
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      required
                      defaultValue={
                        editingAppointment
                          ? format(parseISO(editingAppointment.startDate), 'yyyy-MM-dd')
                          : selectedDate
                          ? format(selectedDate, 'yyyy-MM-dd')
                          : format(new Date(), 'yyyy-MM-dd')
                      }
                      className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                      Start Time
                    </label>
                    <input
                      name="startTime"
                      type="time"
                      defaultValue={
                        editingAppointment && !editingAppointment.allDay
                          ? format(parseISO(editingAppointment.startDate), 'HH:mm')
                          : '09:00'
                      }
                      className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* End Date + Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                      End Date
                    </label>
                    <input
                      name="endDate"
                      type="date"
                      defaultValue={
                        editingAppointment
                          ? format(parseISO(editingAppointment.endDate), 'yyyy-MM-dd')
                          : selectedDate
                          ? format(selectedDate, 'yyyy-MM-dd')
                          : format(new Date(), 'yyyy-MM-dd')
                      }
                      className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                      End Time
                    </label>
                    <input
                      name="endTime"
                      type="time"
                      defaultValue={
                        editingAppointment && !editingAppointment.allDay
                          ? format(parseISO(editingAppointment.endDate), 'HH:mm')
                          : '10:00'
                      }
                      className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      name="location"
                      defaultValue={editingAppointment?.location}
                      placeholder="Office, Zoom link, address..."
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Attendees */}
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                    Attendees
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      name="attendees"
                      defaultValue={editingAppointment?.attendees?.join(', ')}
                      placeholder="Comma-separated names or emails"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
                    Separate multiple attendees with commas
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-medium shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingAppointment(null);
                    }}
                    className="px-6 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
