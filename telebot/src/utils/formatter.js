/**
 * Formats a date into a long Indonesian date string
 * @param {Date|string|number} dueDate - The date to format
 * @returns {string} Formatted date (e.g., "Senin, 13 April 2026")
 */
function formatTaskDueDate(dueDate) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(dueDate));
}

/**
 * Formats a date into an Indonesian hour string (HH:mm)
 * @param {Date|string|number} dueDate - The date to format
 * @returns {string} Formatted hour (e.g., "14:30")
 */
function formatTaskHour(dueDate) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(dueDate));
}

/**
 * Builds a success message for a newly created task
 * @param {Object} newTask - The created task object
 * @returns {string} Formatted HTML message for Telegram
 */
function formatTaskReplyMessage(newTask) {
  let response = `<b>✅ Task berhasil dibuat!</b>\n\n`;
  response += `<b>🪪 ID:</b> ${newTask.id}\n`;
  response += `<b>🛠️ Project:</b> ${newTask.projectName}\n`;
  response += `<b>📝 Task:</b> ${newTask.title}\n`;
  response += `<b>📆 Deadline:</b> ${newTask.dueDate}\n`;
  return response;
}

/**
 * Builds a success message for a newly added database
 * @param {Object} newDb - The created database object
 * @returns {string} Formatted HTML message for Telegram
 */
function formatDatabaseReplyMessage(newDb) {
  let response = `<b>💾 Database udah ditambahkan</b>\n\n`;
  response += `<b>Host:</b> ${newDb.host}:${newDb.port}\n`;
  response += `<b>Database:</b> ${newDb.name}\n`;
  response += `<b>Username:</b> ${newDb.username}\n\n`;
  response += `Kamu bisa pakai database ini untuk pipeline barumu.`;
  return response;
}

/**
 * Builds a summary message for the number of tasks found
 * @param {number} count - Total number of tasks
 * @param {Object} readInfo - Filter criteria used for reading tasks
 * @returns {string} Formatted HTML message for Telegram
 */
function formatTaskCountReply(count, readInfo) {
  let response = `Ada <b>${count}</b> task`;
  if (readInfo.startDate) {
    response += ` untuk periode tersebut.`;
  } else {
    response += ` secara keseluruhan.`;
  }
  return response;
}

/**
 * Builds a list of tasks formatted for display
 * @param {Array<Object>} tasks - List of task objects
 * @returns {string} Formatted HTML message for Telegram
 */
function formatTaskListReply(tasks) {
  if (tasks.length === 0) {
    return "Sepertinya belum ada task yang sesuai kriteria nih.";
  }

  let response = "<b>Daftar Task Kamu:</b>\n\n";
  tasks.forEach((task, index) => {
    const dueDate = task.dueDate ? formatTaskDueDate(task.dueDate) : 'No Deadline';
    
    response += `${task.projects.name}: <b>${task.title}</b>\n`;
    response += `📆 Deadline: ${dueDate}\n\n`;
  });
  return response;
}

/**
 * Builds a success message for a newly created reminder
 * @param {Object} reminder - The created reminder object
 * @returns {string} Formatted HTML message for Telegram
 */
function formatNewReminderReply(reminder) {
  const header = reminder.isPriority ? '📌‼️' : '📌';
  let response = `${header} <b>Reminder berhasil dibuat!</b>\n`;
  response += `${reminder.message}`;
  return response;
}

/**
 * Builds a list of reminders formatted for display
 * @param {Array<Object>} reminder - List of reminder objects
 * @returns {string} Formatted HTML message for Telegram
 */
function formatListReminderReply(reminder) {
  if (reminder.length === 0) {
    return "Belum ada reminder, nih!";
  }
  let response = `<b>Daftar Reminder Kamu:</b>\n\n`;
  reminder.forEach((reminder, index) => {
    const remindAt = reminder.remindAt ? formatTaskDueDate(reminder.remindAt) : 'Tidak ada waktu';
    const remindAtHour = reminder.remindAt ? formatTaskHour(reminder.remindAt) : 'Tidak ada waktu';
    
    response += `<b>${index + 1}.</b> ${reminder.message} ${reminder.isPriority ? '‼️' : ''}\n`;
    response += `${remindAt} ${remindAtHour}\n\n`;
  });
  return response;
}

/**
 * Formats the initial reminder notification message
 * @param {string} message - The reminder message content
 * @param {boolean} isPriority - Whether the reminder is a priority
 * @returns {string} Formatted Markdown message
 */
function formatReminderMessage(message, isPriority = false) {
  const header = isPriority ? '🚨‼️' : '🔔';
  return `${header} Reminder\n\n${message}`;
}

/**
 * Formats the reminder message after it has been marked as completed
 * @param {string} message - The current message text from Telegram
 * @returns {string} Formatted Markdown message for editing
 */
function formatCompletedReminder(message) {
  // Clean the header if it exists
  const cleanMessage = message.replace(/^(🔔 \*REMINDER\*|🚨 \*REMINDER PRIORITAS\*|🔔 REMINDER|🚨 REMINDER PRIORITAS)\n\n/i, '');
  return `✅ *Task beres*\n${cleanMessage}`;
}

/**
 * Formats the reminder message after it has been snoozed
 * @param {string} message - The current message text from Telegram
 * @param {string} snoozeText - Human readable duration (e.g., "30 menit")
 * @returns {string} Formatted Markdown message for editing
 */
function formatSnoozedReminder(message, snoozeText) {
  // Clean the header if it exists
  const cleanMessage = message.replace(/^(🔔 \*REMINDER\*|🚨 \*REMINDER PRIORITAS\*|🔔 REMINDER|🚨 REMINDER PRIORITAS)\n\n/i, '');
  return `💤 *Snoozed*\n${cleanMessage}\n\n_(Akan diingatkan kembali dalam ${snoozeText})_`;
}

export { 
    formatTaskDueDate, 
    formatTaskReplyMessage, 
    formatDatabaseReplyMessage, 
    formatTaskCountReply, 
    formatTaskListReply,
    formatNewReminderReply,
    formatListReminderReply,
    formatReminderMessage,
    formatCompletedReminder,
    formatSnoozedReminder
};