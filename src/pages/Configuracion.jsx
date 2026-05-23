import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Smartphone, Bell, BellRing, BellOff, Loader2, Check, Share2 } from 'lucide-react';
import { sileo } from 'sileo';
import PageHeader from '../components/ui/PageHeader';
import { InstallPWAModal } from '../components/InstallPWAModal';
import { NotificationPromptModal } from '../components/NotificationPromptModal';
import { useNotifications } from '../hooks/useNotifications';
import styles from './Configuracion.module.css';
import { shareApp } from '../utils/shareUtils';

const Configuracion = () => {
    // Estado para modales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNotificationPromptOpen, setIsNotificationPromptOpen] = useState(false);

    // Estado para la PWA
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [installCustomTitle, setInstallCustomTitle] = useState('');
    const [installCustomSubtitle, setInstallCustomSubtitle] = useState('');

    // Hook de notificaciones
    const { isSubscribed, loading: notificationsLoading, pushSupport, subscribe } = useNotifications();

    // Detectar si el usuario bloqueó los permisos manualmente en el navegador
    const isBlocked = 'Notification' in window && Notification.permission === 'denied';

    useEffect(() => {
        // Verificar si ya está ejecutándose como PWA instalada
        const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        setIsStandalone(isStandalonePWA);

        // Si ya se capturó el prompt globalmente en window
        if (window.deferredPrompt) {
            setDeferredPrompt(window.deferredPrompt);
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            window.deferredPrompt = e;
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Evento que se dispara una vez la app se instala con éxito en el sistema
        const handleAppInstalled = () => {
            setIsStandalone(true);
            setDeferredPrompt(null);
            window.deferredPrompt = null;
            sileo.success({
                title: '¡Instalación exitosa!',
                description: 'BusPronto se ha instalado correctamente en su dispositivo.',
                position: 'top-center'
            });
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleOpenInstallModal = () => {
        setInstallCustomTitle('');
        setInstallCustomSubtitle('');
        setIsModalOpen(true);
    };

    const handleAlertsClick = () => {
        if (isSubscribed) {
            return;
        }

        const support = pushSupport || { supported: false, reason: 'unknown' };

        // Si es iOS y no está instalado, forzamos el modal de instalación con mensaje personalizado
        if (support.reason === 'ios-not-installed') {
            setInstallCustomTitle('Instalación Requerida');
            setInstallCustomSubtitle('Para recibir alertas en su iPhone, primero debe instalar BusPronto.');
            setIsModalOpen(true);
            return;
        }

        // Si el navegador de plano no soporta notificaciones
        if (!support.supported) {
            sileo.error({
                title: 'No compatible',
                description: 'Su navegador actual no soporta notificaciones web.',
                position: 'top-center'
            });
            return;
        }

        // Si el usuario ya bloqueó los permisos manualmente en el navegador
        if ('Notification' in window && Notification.permission === 'denied') {
            sileo.info({
                title: 'Notificaciones bloqueadas',
                description: 'Ha bloqueado las notificaciones. Para activarlas, haga clic en el ícono 🔒 a la izquierda de la barra de URL y cambie el permiso a "Permitir".',
                position: 'top-center',
                duration: 7000
            });
            return;
        }

        // Si todo está bien, mostramos nuestro Soft Prompt
        setIsNotificationPromptOpen(true);
    };

    const handleAcceptNotifications = async () => {
        const result = await subscribe();
        if (result.success) {
            sileo.success({
                title: '¡Suscrito!',
                description: 'Usted recibirá alertas importantes de BusPronto.',
                position: 'top-center'
            });
            setIsNotificationPromptOpen(false);
        } else {
            if (result.reason !== 'permission-denied') {
                sileo.error({
                    title: 'Error',
                    description: 'No pudimos activar las notificaciones. Por favor, revise los permisos de su navegador.',
                    position: 'top-center'
                });
            }
            setIsNotificationPromptOpen(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Configuración - BusPronto</title>
                <meta name="description" content="Configure la instalación de la aplicación y las notificaciones para recibir alertas en tiempo real." />
            </Helmet>

            <div className="glass-card">
                <PageHeader
                    title="Configuración"
                    description="Personalice las opciones y alertas de la aplicación"
                    showBackButton={true}
                    backUrl="/"
                />

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Ajustes de la Aplicación</h2>
                        <div className={styles.settingsContainer}>

                            {!isStandalone && (
                                <div className={styles.settingCard}>
                                    <div className={styles.settingInfo}>
                                        <div className={`${styles.settingIcon} ${styles.primary}`}>
                                            <Smartphone size={24} />
                                        </div>
                                        <div className={styles.settingText}>
                                            <h3 className={styles.settingTitle}>Instalar BusPronto</h3>
                                            <p className={styles.settingDescription}>
                                                Añada la aplicación a su pantalla de inicio para un acceso más rápido.
                                            </p>
                                        </div>
                                    </div>
                                    <button className={styles.settingAction} onClick={handleOpenInstallModal}>
                                        Instalar App
                                    </button>
                                </div>
                            )}

                            <div className={styles.settingCard}>
                                <div className={styles.settingInfo}>
                                    <div className={`${styles.settingIcon} ${isSubscribed ? styles.success : isBlocked ? styles.blocked : styles.primary}`}>
                                        {isSubscribed ? <BellRing size={24} /> : isBlocked ? <BellOff size={24} /> : <Bell size={24} />}
                                    </div>
                                    <div className={styles.settingText}>
                                        <h3 className={styles.settingTitle}>Alertas y Notificaciones</h3>
                                        <p className={styles.settingDescription}>
                                            {isBlocked
                                                ? 'Ha bloqueado las notificaciones en este navegador.'
                                                : 'Reciba avisos automáticos sobre cambios de horario y atrasos de buses.'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className={`${styles.settingAction} ${isSubscribed ? styles.active : isBlocked ? styles.blocked : ''}`}
                                    onClick={handleAlertsClick}
                                    disabled={notificationsLoading || isSubscribed}
                                >
                                    {notificationsLoading ? (
                                        <><Loader2 size={16} className="animate-spin" /> Verificando...</>
                                    ) : isSubscribed ? (
                                        <><Check size={16} /> Activadas</>
                                    ) : isBlocked ? (
                                        <><BellOff size={16} /> Bloqueadas</>
                                    ) : (
                                        'Activar Alertas'
                                    )}
                                </button>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingInfo}>
                                    <div className={`${styles.settingIcon} ${styles.primary}`}>
                                        <Share2 size={24} />
                                    </div>
                                    <div className={styles.settingText}>
                                        <h3 className={styles.settingTitle}>Compartir Aplicación</h3>
                                        <p className={styles.settingDescription}>
                                            Comparta el enlace de BusPronto con sus amigos y compañeros de la UCR.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className={styles.settingAction}
                                    onClick={shareApp}
                                >
                                    Compartir
                                </button>
                            </div>

                        </div>
                    </section>
                </div>
            </div>

            {/* Modales de Ajustes */}
            <InstallPWAModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                deferredPrompt={deferredPrompt}
                customTitle={installCustomTitle}
                customSubtitle={installCustomSubtitle}
                onNativeInstallSuccess={() => {
                    setIsStandalone(true);
                    sileo.success({
                        title: '¡Instalación iniciada!',
                        description: 'BusPronto se está instalando en su dispositivo.',
                        position: 'top-center'
                    });
                }}
            />

            <NotificationPromptModal
                isOpen={isNotificationPromptOpen}
                onClose={() => setIsNotificationPromptOpen(false)}
                onAccept={handleAcceptNotifications}
                loading={notificationsLoading}
            />
        </>
    );
};

export default Configuracion;
