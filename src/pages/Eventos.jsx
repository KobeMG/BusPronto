import { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EventCard from '../components/ui/EventCard';
import { useEventsQuery } from '../hooks/useEventsQuery';
import { groupEventsByDate, formatDate } from '../utils/eventosUtils';
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
                    setActiveTab(foundEvent.event_date_start);
                    return;
                }
            }
            setActiveTab(groupedEvents[0].date);
        }
    }, [groupedEvents, activeTab, events, sharedEventId]);

    // Scroll automático al evento compartido
    useEffect(() => {
        if (sharedEventId && activeTab) {
            const foundEvent = events?.find(e => String(e.id) === String(sharedEventId));
            if (foundEvent && foundEvent.event_date_start === activeTab) {
                const timer = setTimeout(() => {
                    const element = document.getElementById(`event-card-${sharedEventId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 200);
                return () => clearTimeout(timer);
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
            const index = groupedEvents.findIndex(item => item.date === activeTab);
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
                            {groupedEvents.map(({ date }) => {
                                const { day, full } = formatDate(date);
                                const isActive = activeTab === date;
                                return (
                                    <div key={date} className={styles.tabSlide}>
                                        <button
                                            className={`${styles.tabButton} ${isActive ? styles.activeTab : ''}`}
                                            onClick={() => setActiveTab(date)}
                                        >
                                            <span className={styles.tabDayName}>{day}</span>
                                            <span className={styles.tabFullDate}>{full}</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contenido del Día Seleccionado */}
                    {groupedEvents.map(({ date, eventList }) => {
                        if (date !== activeTab) return null;

                        return (
                            <section key={date} className={styles.daySection}>
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
