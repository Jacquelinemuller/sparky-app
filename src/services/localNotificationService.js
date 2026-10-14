import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Convierte "al_1234567890123" → número int32 estable para el plugin
function alarmIdToNumber(alarmId) {
  const cleaned = String(alarmId).replace(/\D/g, '');
  const num = parseInt(cleaned.slice(-9), 10);
  return isNaN(num) ? Math.floor(Math.random() * 1_000_000_000) : num;
}

// Fecha/hora a la que debe sonar la alarma (o null si ya pasó)
function getAlarmDate(alarm) {
  if (!alarm || !alarm.time) return null;

  const [h, m] = alarm.time.split(':').map((n) => parseInt(n, 10));
  if (isNaN(h) || isNaN(m)) return null;

  const now = new Date();
  let target = new Date();

  if (alarm.dateKey) {
    // Alarma con fecha específica
    const [y, mo, d] = alarm.dateKey.split('-').map(Number);
    target = new Date(y, mo - 1, d, h, m, 0, 0);
  } else {
    // Alarma sin fecha específica → hoy a esa hora.
    // Si ya pasó, la programamos para mañana.
    target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
  }

  if (target.getTime() <= now.getTime()) return null;
  return target;
}

// Verifica/crea el canal de notificaciones (necesario en Android 8+)
export async function ensureChannel() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: 'alarmas',
      name: 'Alarmas Sparky',
      description: 'Recordatorios de tus misiones',
      importance: 5,        // MAX: heads-up + sonido + vibración
      visibility: 1,
      vibration: true,
      sound: undefined,     // sonido por defecto del sistema
      lights: true,
      lightColor: '#ff6b00'
    });
  } catch (e) {
    console.warn('No se pudo crear el canal de notificaciones:', e);
  }
}

// Pide permisos de notificación
export async function requestNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      perm = await LocalNotifications.requestPermissions();
    }
    return perm.display === 'granted';
  } catch (e) {
    console.warn('Error pidiendo permisos de notificación:', e);
    return false;
  }
}

// Programa UNA alarma como notificación local
export async function scheduleAlarmNotification(alarm) {
  if (!Capacitor.isNativePlatform()) return;

  const when = getAlarmDate(alarm);
  if (!when) return; // ya pasó o inválida

  const id = alarmIdToNumber(alarm.id);

  try {
    // Cancelamos por si ya existía una programada con ese ID
    await LocalNotifications.cancel({ notifications: [{ id }] });

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: '⏰ ' + (alarm.label || 'Es hora'),
          body: alarm.leadMinutes
            ? `Faltan ${alarm.leadMinutes} min`
            : '¡Es el momento! Toca para ver',
          schedule: {
            at: when,
            allowWhileIdle: true   // 🔑 dispara incluso en modo Doze
          },
          channelId: 'alarmas',
          smallIcon: 'ic_launcher',
          iconColor: '#ea580c',
          sound: undefined,
          ongoing: false,
          autoCancel: true,
          extra: {
            alarmId: alarm.id,
            route: 'alarm'
          }
        }
      ]
    });
    console.log('✅ Notificación programada:', alarm.label, '→', when.toLocaleString());
  } catch (e) {
    console.warn('Error programando notificación:', e);
  }
}

// Cancela la notificación de una alarma
export async function cancelAlarmNotification(alarmId) {
  if (!Capacitor.isNativePlatform()) return;
  const id = alarmIdToNumber(alarmId);
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch (e) {
    // silencioso
  }
}

// Sincroniza TODAS las alarmas: programa las válidas, cancela las ya disparadas/deshabilitadas
export async function syncAlarms(alarms) {
  if (!Capacitor.isNativePlatform()) return;
  if (!alarms || alarms.length === 0) return;

  await ensureChannel();

  const now = new Date();

  for (const alarm of alarms) {
    const shouldBeScheduled =
      alarm.enabled !== false &&
      !alarm.triggered &&
      getAlarmDate(alarm) !== null;

    if (shouldBeScheduled) {
      await scheduleAlarmNotification(alarm);
    } else {
      await cancelAlarmNotification(alarm.id);
    }
  }
}