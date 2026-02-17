import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { ro } from 'date-fns/locale';

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

const WEEKDAYS = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'] as const;

const MONTH_NAMES = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
] as const;

const TYPE_CONFIG: Record<
  Appointment['type'],
  { label: string; color: string; dotColor: string; chipColor: string; icon: typeof CalendarIcon }
> = {
  meeting: {
    label: 'Întâlnire',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dotColor: 'bg-blue-500',
    chipColor: 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/30',
    icon: Users,
  },
  call: {
    label: 'Apel',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dotColor: 'bg-green-500',
    chipColor: 'bg-green-100/80 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-200/50 dark:border-green-800/30',
    icon: Phone,
  },
  video_call: {
    label: 'Apel Video',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    dotColor: 'bg-purple-500',
    chipColor: 'bg-purple-100/80 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/30',
    icon: Video,
  },
  other: {
    label: 'Altul',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    dotColor: 'bg-gray-500',
    chipColor: 'bg-gray-100/80 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300 border border-gray-200/50 dark:border-gray-800/30',
    icon: CalendarIcon,
  },
};

function getMonthYearLabel(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showForm) { setShowForm(false); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Calculate the date range visible on the calendar (includes overflow days)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data, isLoading, isError } = useQuery({
    queryKey: ['appointments', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('startDate', format(calendarStart, 'yyyy-MM-dd'));
      params.set('endDate', format(calendarEnd, 'yyyy-MM-dd'));
      params.set('limit', '200');
      const { data } = await api.get(`/appointments?${params}`);
      return data.data;
    },
    retry: 2,
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
      toast.success(editingAppointment ? 'Programare actualizată' : 'Programare creată');
      setShowForm(false);
      setEditingAppointment(null);
    },
    onError: () => {
      toast.error(editingAppointment ? 'Nu s-a putut actualiza programarea' : 'Nu s-a putut salva programarea');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Programare ștearsă');
      setShowDeleteConfirm(null);
    },
    onError: () => {
      toast.error('Nu s-a putut șterge programarea');
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
    <div className="space-y-7 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[14px] text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">{data?.total ?? 0}</span> programări luna aceasta
        </p>
        <button
          onClick={() => openCreateForm(selectedDate || new Date())}
          className="flex items-center gap-2 md:gap-2.5 px-3.5 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[14px] md:text-[15px] font-semibold shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" /> Programare Nouă
        </button>
      </div>

      {/* Calendar + Side Panel */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-4 md:px-7 py-4 md:py-5 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-4">
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
                {getMonthYearLabel(currentMonth)}
              </h2>
              <button
                onClick={handleToday}
                className="px-4 py-1.5 text-[13px] font-semibold rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/60 hover:border-indigo-500/30 transition-all"
              >
                Astăzi
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-2.5 rounded-xl hover:bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] transition-all"
                aria-label="Luna anterioară"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2.5 rounded-xl hover:bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] transition-all"
                aria-label="Luna următoare"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-[var(--border-color)]">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="px-2 py-3.5 text-center text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
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
                  className="min-h-[110px] p-2.5 border-b border-r border-[var(--border-color)]"
                >
                  <div className="skeleton h-6 w-6 rounded-full mb-2" />
                  <div className="space-y-1">
                    <div className="skeleton h-3.5 w-3/4 rounded" />
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
                      'min-h-[110px] p-2.5 border-b border-r border-[var(--border-color)] text-left transition-all duration-200 relative group',
                      inCurrentMonth
                        ? 'bg-transparent'
                        : 'bg-[var(--bg-secondary)]/30',
                      isSelected && 'ring-2 ring-inset ring-indigo-500 bg-indigo-500/[0.03]',
                      !isSelected && 'hover:bg-[var(--bg-secondary)]/40'
                    )}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          'relative inline-flex items-center justify-center w-8 h-8 rounded-full text-[15px] font-medium transition-colors',
                          today && 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20',
                          !today && inCurrentMonth && 'text-[var(--text-primary)]',
                          !today && !inCurrentMonth && 'text-[var(--text-tertiary)]'
                        )}
                      >
                        {format(day, 'd')}
                        {/* Animated pulse ring for today */}
                        {today && (
                          <span className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" style={{ animationDuration: '2s' }} />
                        )}
                      </span>
                      {dayAppointments.length > 0 && (
                        <span className="text-[12px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-secondary)]/60 px-2 py-0.5 rounded-md">
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
                              'flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] leading-tight truncate',
                              config.chipColor
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
                        <div className="text-[11px] font-semibold text-[var(--text-tertiary)] px-2">
                          +{dayAppointments.length - 3} mai mult
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-5 px-7 py-4 border-t border-[var(--border-color)]">
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={cn('w-2.5 h-2.5 rounded-full', config.dotColor)} />
                <span className="text-[13px] text-[var(--text-tertiary)]">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel: Selected Day Detail */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl overflow-hidden sticky top-6">
            {/* Panel Header */}
            <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                  {selectedDate ? format(selectedDate, 'EEEE, d MMM', { locale: ro }) : 'Selectează o zi'}
                </h3>
                <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
                  {selectedDate
                    ? `${selectedDateAppointments.length} programar${selectedDateAppointments.length !== 1 ? 'e' : 'i'}`
                    : 'Apasă pe o zi pentru detalii'}
                </p>
              </div>
              {selectedDate && (
                <button
                  onClick={() => openCreateForm(selectedDate)}
                  className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                  title="Adaugă programare"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Panel Content */}
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
              {!selectedDate ? (
                <div className="px-6 py-14 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
                    <CalendarIcon className="w-7 h-7 text-[var(--text-tertiary)] opacity-50" />
                  </div>
                  <p className="text-[15px] font-medium text-[var(--text-secondary)]">Nicio zi selectată</p>
                  <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
                    Selectează o zi din calendar pentru a vedea programările
                  </p>
                </div>
              ) : selectedDateAppointments.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
                    <CalendarIcon className="w-7 h-7 text-[var(--text-tertiary)] opacity-50" />
                  </div>
                  <p className="text-[15px] font-medium text-[var(--text-secondary)]">Nicio programare</p>
                  <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5 mb-3">
                    Această zi este liberă pentru activități noi
                  </p>
                  <button
                    onClick={() => openCreateForm(selectedDate)}
                    className="text-[15px] font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
                  >
                    + Adaugă una
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-color)]">
                  {selectedDateAppointments.map((apt, index) => {
                    const config = getTypeConfig(apt.type);
                    const TypeIcon = config.icon;
                    const isDeleting = showDeleteConfirm === apt.id;

                    return (
                      <div
                        key={apt.id}
                        className="px-6 py-5 hover:bg-[var(--bg-secondary)]/40 transition-all duration-200 group relative animate-fadeInUp"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Delete Confirmation Overlay */}
                        {isDeleting && (
                          <div className="absolute inset-0 bg-white/90 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center gap-2 z-10 px-4 rounded-xl animate-fadeIn">
                            <span className="text-[15px] text-[var(--text-secondary)]">Ștergi?</span>
                            <button
                              onClick={() => deleteMutation.mutate(apt.id)}
                              disabled={deleteMutation.isPending}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold rounded-xl transition-all disabled:opacity-50"
                            >
                              {deleteMutation.isPending ? 'Se șterge...' : 'Confirmă'}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-4 py-2 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] text-[13px] font-semibold rounded-xl hover:bg-[var(--bg-secondary)] transition-all"
                            >
                              Anulează
                            </button>
                          </div>
                        )}

                        {/* Appointment Card */}
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-105',
                              config.color
                            )}
                          >
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">
                                {apt.title}
                              </h4>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditForm(apt);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)]/60 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all"
                                  title="Editează"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(apt.id);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--text-tertiary)] hover:text-red-600 transition-all"
                                  title="Șterge"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Type Badge */}
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold mt-1',
                                config.chipColor
                              )}
                            >
                              {config.label}
                            </span>

                            {/* Time */}
                            <div className="flex items-center gap-1.5 mt-2 text-[13px] text-[var(--text-secondary)]">
                              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                              {apt.allDay ? (
                                <span>Toată ziua</span>
                              ) : (
                                <span>
                                  {formatTime(apt.startDate)} &ndash; {formatTime(apt.endDate)}
                                </span>
                              )}
                            </div>

                            {/* Location */}
                            {apt.location && (
                              <div className="flex items-center gap-1.5 mt-1 text-[13px] text-[var(--text-secondary)]">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{apt.location}</span>
                              </div>
                            )}

                            {/* Attendees */}
                            {apt.attendees && apt.attendees.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1 text-[13px] text-[var(--text-secondary)]">
                                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">
                                  {apt.attendees.length} participant{apt.attendees.length !== 1 ? 'i' : ''}
                                </span>
                              </div>
                            )}

                            {/* Description */}
                            {apt.description && (
                              <p className="mt-2 text-[13px] text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl w-full max-w-lg mx-4 animate-fadeInScale shadow-2xl shadow-black/10 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-t-2xl" />
            {/* Modal Header */}
            <div className="flex items-center justify-between px-7 pt-7 pb-5">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  {editingAppointment ? 'Editează Programare' : 'Programare Nouă'}
                </h2>
                <p className="text-[15px] text-[var(--text-secondary)] mt-0.5">
                  {editingAppointment ? 'Actualizează detaliile programării' : 'Planifică o programare nouă'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAppointment(null);
                }}
                className="p-2.5 rounded-xl hover:bg-[var(--bg-secondary)]/60 text-[var(--text-tertiary)] transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 pb-7">
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                    Titlu *
                  </label>
                  <input
                    name="title"
                    defaultValue={editingAppointment?.title}
                    required
                    placeholder="ex., Apel verificare client"
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                    Descriere
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingAppointment?.description}
                    placeholder="Adaugă note sau puncte pe agendă..."
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all resize-none"
                  />
                </div>

                {/* Type + All Day */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                      Tip
                    </label>
                    <select
                      name="type"
                      defaultValue={editingAppointment?.type || 'meeting'}
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                    >
                      <option value="meeting">Întâlnire</option>
                      <option value="call">Apel</option>
                      <option value="video_call">Apel Video</option>
                      <option value="other">Altul</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="allDay"
                        defaultChecked={editingAppointment?.allDay}
                        className="w-5 h-5 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                      />
                      <span className="text-[15px] font-medium text-[var(--text-secondary)]">
                        Toată Ziua
                      </span>
                    </label>
                  </div>
                </div>

                {/* Start Date + Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                      Data Început *
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
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                      Ora Început
                    </label>
                    <input
                      name="startTime"
                      type="time"
                      defaultValue={
                        editingAppointment && !editingAppointment.allDay
                          ? format(parseISO(editingAppointment.startDate), 'HH:mm')
                          : '09:00'
                      }
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* End Date + Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                      Data Sfârșit
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
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                      Ora Sfârșit
                    </label>
                    <input
                      name="endTime"
                      type="time"
                      defaultValue={
                        editingAppointment && !editingAppointment.allDay
                          ? format(parseISO(editingAppointment.endDate), 'HH:mm')
                          : '10:00'
                      }
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                    Locație
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                    <input
                      name="location"
                      defaultValue={editingAppointment?.location}
                      placeholder="Birou, link Zoom, adresă..."
                      className="w-full pl-11 pr-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* Attendees */}
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                    Participanți
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                    <input
                      name="attendees"
                      defaultValue={editingAppointment?.attendees?.join(', ')}
                      placeholder="Nume sau emailuri separate prin virgulă"
                      className="w-full pl-11 pr-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                    />
                  </div>
                  <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">
                    Separă participanții multipli prin virgulă
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                  >
                    {createMutation.isPending ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Se salvează...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {editingAppointment ? 'Actualizează Programare' : 'Creează Programare'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingAppointment(null);
                    }}
                    className="px-7 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-[15px] font-semibold hover:bg-[var(--bg-secondary)] transition-all"
                  >
                    Anulează
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
