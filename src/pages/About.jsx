import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Instagram, Github, Globe, Linkedin, ExternalLink, Heart, Coffee, Phone, Copy, Check, Eye } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import styles from './About.module.css';

const About = () => {
    const [showSinpe, setShowSinpe] = useState(false);
    const [copied, setCopied] = useState(false);
    const sinpeNumber = "8745-8295";

    const handleCopy = () => {
        const cleanNumber = sinpeNumber.replace(/-/g, '');
        navigator.clipboard.writeText(cleanNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <>
            <Helmet>
                <title>Acerca de - BusPronto</title>
                <meta name="description" content="Conoce más sobre el proyecto BusPronto, el equipo detrás y cómo contactarnos." />
            </Helmet>

            <div className="glass-card">
                <PageHeader
                    title="Acerca de BusPronto"
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
                        <h2 className={styles.sectionTitle}>Apoyar el Proyecto</h2>
                        <p className={styles.text}>
                            Si BusPronto le ha sido útil y desea apoyar su mantenimiento y desarrollo continuo, puede hacerlo mediante un "cafecito" virtual.
                        </p>

                        <div className={styles.supportContainer}>
                            {/* Opción Ko-fi */}
                            <div className={styles.supportOption}>
                                <div className={styles.supportIcon} style={{ background: '#29abe0' }}>
                                    <Coffee size={24} color="white" />
                                </div>
                                <div className={styles.supportInfo}>
                                    <h3 className={styles.supportType}>Internacional / Tarjeta</h3>
                                    <p className={styles.supportDescription}>Seguro y privado vía Ko-fi</p>
                                </div>
                                <a 
                                    href="https://ko-fi.com/kobemg" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={styles.kofiButtonSmall}
                                >
                                    Ko-fi
                                </a>
                            </div>

                            {/* Opción SINPE */}
                            <div className={`${styles.supportOption} ${showSinpe ? styles.activeSinpe : ''}`}>
                                <div className={styles.supportIcon} style={{ background: '#10b981' }}>
                                    <Phone size={24} color="white" />
                                </div>
                                
                                <div className={styles.supportInfo}>
                                    <h3 className={styles.supportType}>Local (Costa Rica)</h3>
                                    {!showSinpe ? (
                                        <p className={styles.supportDescription}>SINPE Móvil directo</p>
                                    ) : (
                                        <div className={styles.sinpeRevealContent}>
                                            <span className={styles.sinpeNumberDisplay}>{sinpeNumber}</span>
                                            <span className={styles.sinpeOwner}>Kobe Williams</span>
                                        </div>
                                    )}
                                </div>

                                {!showSinpe ? (
                                    <button 
                                        className={styles.revealButton}
                                        onClick={() => setShowSinpe(true)}
                                    >
                                        <Eye size={16} />
                                        Ver
                                    </button>
                                ) : (
                                    <button 
                                        className={styles.copyButtonSmall}
                                        onClick={handleCopy}
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                )}
                            </div>
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
                        <p>© 2026 Kode Creative</p>
                        <p>Distribuido bajo licencia <strong>AGPL-3.0</strong></p>
                        <p>Version 2.0.0 - Actualización de Eventos</p>
                    </footer>

                </div>
            </div>
        </>
    );
};

export default About;
