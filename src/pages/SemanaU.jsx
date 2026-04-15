import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EventCard from '../components/ui/EventCard';
import { useSemanaUQuery } from '../hooks/useSemanaUQuery';
import { groupEventsByDate, formatDate } from '../utils/semanaUUtils';
import styles from './SemanaU.module.css';

const SemanaU = () => {
    const { data: events, isLoading, error } = useSemanaUQuery();

    // Agrupamos eventos por fecha
    const groupedEvents = useMemo(() => groupEventsByDate(events), [events]);
    const [activeTab, setActiveTab] = useState(null);

    // Seleccionar el primer día por defecto cuando cargan los datos
    useEffect(() => {
        if (groupedEvents && groupedEvents.length > 0 && !activeTab) {
            setActiveTab(groupedEvents[0].date);
        }
    }, [groupedEvents, activeTab]);

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
                <title>Semana U 2026 – Agenda de Eventos | BusPronto (UCR)</title>
                <meta name="description" content="Agenda completa de eventos para la Semana Universitaria 2026 en la UCR. Conciertos, talleres, y actividades en tiempo real." />
                <link rel="canonical" href="https://www.buspronto.lat/semana-u" />
            </Helmet>

            <PageHeader
                title="Agenda Semana U 2026"
                description={
                    <>
                        Consulte las redes de la{" "}
                        <a
                            href="https://www.instagram.com/feucr/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}
                        >
                            FEUCR
                        </a>{" "}
                        para más información
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
                    {/* Tabs de Navegación por Día */}
                    <div className={styles.tabsContainer}>
                        {groupedEvents.map(({ date }) => {
                            const { day, full } = formatDate(date);
                            const isActive = activeTab === date;
                            return (
                                <button
                                    key={date}
                                    className={`${styles.tabButton} ${isActive ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab(date)}
                                >
                                    <span className={styles.tabDayName}>{day}</span>
                                    <span className={styles.tabFullDate}>{full}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Contenido del Día Seleccionado */}
                    {groupedEvents.map(({ date, eventList }) => {
                        if (date !== activeTab) return null;
                        
                        return (
                            <section key={date} className={styles.daySection}>
                                <div className={styles.eventsGrid}>
                                    {eventList.map((event, index) => (
                                        <div key={event.id} style={{ animationDelay: `${index * 0.05}s` }} className={styles.animatedCard}>
                                            <EventCard event={event} />
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

export default SemanaU;
