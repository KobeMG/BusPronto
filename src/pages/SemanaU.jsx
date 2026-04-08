import React, { useMemo } from 'react';
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
                title="Semana U 2026"
                description="Agenda de actividades de la Sede Rodrigo Facio"
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
                    {groupedEvents.map(({ date, eventList }) => {
                        const { day, full } = formatDate(date);
                        return (
                            <section key={date} className={styles.daySection}>
                                <div className={styles.dateHeader}>
                                    <h2 className={styles.dayName}>{day}</h2>
                                    <span className={styles.fullDate}>{full}</span>
                                </div>
                                <div className={styles.eventsGrid}>
                                    {eventList.map(event => (
                                        <EventCard key={event.id} event={event} />
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
