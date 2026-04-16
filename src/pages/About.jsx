import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Instagram, Github, Globe, Linkedin, Info, ExternalLink } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import styles from './About.module.css';

const About = () => {
    return (
        <>
            <Helmet>
                <title>Acerca de - BusPronto</title>
                <meta name="description" content="Conoce más sobre el proyecto BusPronto, el equipo detrás y cómo contactarnos." />
            </Helmet>

            <div className="glass-card">
                <PageHeader
                    title="Acerca de BusPronto"
                    icon={<Info size={28} color="var(--accent-primary)" />}
                    description="Información del proyecto y contacto"
                    showBackButton={true}
                    backUrl="/"
                />

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Desarrollo</h2>
                        <p className={styles.text}>
                            Desarrollado con ❤️ por
                            <a href="https://kobemg.com/" target="_blank" rel="noopener noreferrer" className={styles.link}> Kode Creative</a>.
                        </p>

                        <div className={styles.socialGrid}>
                            <a href="https://instagram.com/kobemg" target="_blank" rel="noopener noreferrer" className={styles.socialCard}>
                                <Instagram size={24} />
                                <span>Instagram</span>
                            </a>
                            <a href="https://github.com/kobemg" target="_blank" rel="noopener noreferrer" className={styles.socialCard}>
                                <Github size={24} />
                                <span>GitHub</span>
                            </a>
                            <a href="https://linkedin.com/in/kobemg" target="_blank" rel="noopener noreferrer" className={styles.socialCard}>
                                <Linkedin size={24} />
                                <span>LinkedIn</span>
                            </a>
                            <a href="https://kobemg.com/" target="_blank" rel="noopener noreferrer" className={styles.socialCard}>
                                <Globe size={24} />
                                <span>Web</span>
                            </a>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Nota Importante</h2>
                        <div className={styles.disclaimerCard}>
                            <p className={styles.disclaimerText}>
                                BusPronto es un <strong>proyecto independiente e informativo</strong>.
                                No es una aplicación oficial de la Universidad de Costa Rica (UCR) ni de las empresas de transporte mencionadas.
                            </p>
                            <a
                                href="https://www.ucr.ac.cr/acerca-u/campus/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.officialLink}
                            >
                                <ExternalLink size={16} />
                                Ver horarios oficiales UCR
                            </a>
                        </div>
                    </section>

                    <footer className={styles.miniFooter}>
                        <p>© 2026 BusPronto (UCR).</p>
                        <p>Version 2.0.0 - Actualización de Eventos</p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default About;
