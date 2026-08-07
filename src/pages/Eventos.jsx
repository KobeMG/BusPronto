import { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EventCard from '../components/ui/EventCard';
import { useEventsQuery } from '../hooks/useEventsQuery';
import { groupEventsByDate } from '../utils/eventosUtils';
import styles from './Eventos.module.css';

const Eventos = () => {
    const { data: events, isLoading, error } = useEventsQuery();

    // Obtener ID de evento de la URL si existe
    const sharedEventId = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }, []);

    // Agrupamos eventos por fecha
    const groupedEvents = useMemo(() => groupEventsByDate(events), [events]);
    const [activeTab, setActiveTab] = useState(null);

    // Seleccionar el primer día por defecto o el del evento compartido cuando cargan los datos
    useEffect(() => {
        if (groupedEvents && groupedEvents.length > 0 && !activeTab) {
            if (sharedEventId) {
                const foundEvent = events?.find(e => String(e.id) === String(sharedEventId));
                if (foundEvent) {
                    const firstDate = (foundEvent.event_dates && foundEvent.event_dates.length > 0) ? foundEvent.event_dates[0] : foundEvent.event_date_start;
                    if (firstDate) {
                        let dayIndex = new Date(firstDate + 'T12:00:00').getDay();
                        dayIndex = dayIndex === 0 ? 7 : dayIndex;
                        setActiveTab(String(dayIndex));
                        return;
                    }
                }
            }
            setActiveTab(groupedEvents[0].id);
        }
    }, [groupedEvents, activeTab, events, sharedEventId]);

    // Scroll automático al evento compartido
    useEffect(() => {
        if (sharedEventId && activeTab) {
            const foundEvent = events?.find(e => String(e.id) === String(sharedEventId));
            if (foundEvent) {
                const firstDate = (foundEvent.event_dates && foundEvent.event_dates.length > 0) ? foundEvent.event_dates[0] : foundEvent.event_date_start;
                if (firstDate) {
                    let eventDayIndex = new Date(firstDate + 'T12:00:00').getDay();
                    eventDayIndex = eventDayIndex === 0 ? 7 : eventDayIndex;
                    
                    if (String(eventDayIndex) === activeTab) {
                        const timer = setTimeout(() => {
                            const element = document.getElementById(`event-card-${sharedEventId}`);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 200);
                        return () => clearTimeout(timer);
                    }
                }
            }
        }
    }, [activeTab, events, sharedEventId]);

    // Configuración de Embla para los tabs
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: true
    });

    // Asegurar que el tab activo esté a la vista al cambiar
    useEffect(() => {
        if (emblaApi && activeTab) {
            const index = groupedEvents.findIndex(item => item.id === activeTab);
            if (index !== -1) emblaApi.scrollTo(index);
        }
    }, [emblaApi, activeTab, groupedEvents]);

    if (isLoading) {
        return (
            <div className="glass-card">
                <LoadingSpinner text="Cargando agenda de eventos..." />
            </div>
        );
    }

    return (
        <div className="glass-card">
            <Helmet>
                <title>Eventos | BusPronto (UCR)</title>
                <meta name="description" content="Agenda completa de eventos para la Semana Universitaria 2026 en la UCR. Conciertos, talleres, y actividades en tiempo real." />
                <link rel="canonical" href="https://www.buspronto.lat/semana-u" />
                <meta property="og:title" content="Semana U 2026 – Agenda de Eventos | BusPronto (UCR)" />
                <meta property="og:description" content="No te pierdas ningún detalle de la Semana U 2026. Consulta conciertos y actividades." />
                <meta property="og:url" content="https://www.buspronto.lat/semana-u" />
                <meta property="og:image" content="https://www.buspronto.lat/logo512x512.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://www.buspronto.lat/logo512x512.png" />
            </Helmet>

            <PageHeader
                title="Agenda de Eventos"
                description={
                    <>
                        La UCR no es solo estudiar, también es disfrutar de eventos.
                    </>
                }
                showBackButton={true}
                backUrl="/"
            />


            {error || groupedEvents.length === 0 ? (
                <div className={styles.emptyState}>
                    <Calendar size={48} className={styles.emptyIcon} />
                    <p>No se encontraron eventos programados para los próximos días.</p>
                </div>
            ) : (
                <div className={styles.container}>
                    {/* Tabs de Navegación por Día (ahora con Embla para scroll por mouse) */}
                    <div className={styles.emblaTabs} ref={emblaRef}>
                        <div className={styles.tabsContainer}>
                            {groupedEvents.map(({ id, dayName }) => {
                                const isActive = activeTab === id;
                                return (
                                    <div key={id} className={styles.tabSlide}>
                                        <button
                                            className={`${styles.tabButton} ${isActive ? styles.activeTab : ''}`}
                                            onClick={() => setActiveTab(id)}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <span className={styles.tabDayName} style={{ fontSize: '1rem', textTransform: 'capitalize' }}>
                                                {dayName}
                                            </span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contenido del Día Seleccionado */}
                    {groupedEvents.map(({ id, eventList }) => {
                        if (id !== activeTab) return null;

                        return (
                            <section key={id} className={styles.daySection}>
                                <div className={styles.eventsGrid}>
                                    {eventList.map((event, index) => (
                                        <div key={event.id} style={{ animationDelay: `${index * 0.05}s` }} className={styles.animatedCard}>
                                            <EventCard event={event} isHighlighted={sharedEventId && String(event.id) === String(sharedEventId)} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Eventos;
