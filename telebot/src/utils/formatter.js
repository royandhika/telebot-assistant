function formatTaskDueDate(dueDate) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(new Date(dueDate)) + ' WIB';
}

function buildTaskReplyMessage(newTask) {
  let response = `<b>✅ Task berhasil dibuat!</b>\n\n`;
  response += `<b>🪪 ID:</b> ${newTask.id}\n`;
  response += `<b>🛠️ Project:</b> ${newTask.projectName}\n`;
  response += `<b>📝 Task:</b> ${newTask.title}\n`;
  response += `<b>📆 Deadline:</b> ${newTask.dueDate}\n`;
  return response;
}

function buildDatabaseReplyMessage(newDb) {
  let response = `<b>💾 Database udah ditambahkan</b>\n\n`;
  response += `<b>Host:</b> ${newDb.host}:${newDb.port}\n`;
  response += `<b>Database:</b> ${newDb.name}\n`;
  response += `<b>Username:</b> ${newDb.username}\n\n`;
  response += `Kamu bisa pakai database ini untuk pipeline barumu.`;
  return response;
}

function buildTaskCountReply(count, readInfo) {
  let response = `Ada <b>${count}</b> task`;
  if (readInfo.startDate) {
    response += ` untuk periode tersebut.`;
  } else {
    response += ` secara keseluruhan.`;
  }
  return response;
}

function buildTaskListReply(tasks) {
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

function buildNewReminderReply(reminder) {
  let response = `<b>✅ Reminder berhasil dibuat!</b>\n\n`;
  response += `<b>Reminder:</b> ${reminder.message}\n`;
  response += `<b>Waktu:</b> ${reminder.remindAt ? formatTaskDueDate(reminder.remindAt) : 'Tidak ada waktu'}\n`;
  response += `<b>Prioritas:</b> ${reminder.isPriority ? 'Ya' : 'Tidak'}\n`;
  return response;
}

function buildListReminderReply(reminder) {
  let response = `<b>Daftar Reminder Kamu:</b>\n\n`;
  reminder.forEach((reminder, index) => {
    const remindAt = reminder.remindAt ? formatTaskDueDate(reminder.remindAt) : 'Tidak ada waktu';
    
    response += `<b>${index + 1}. ${reminder.message}</b>\n`;
    response += `📆 Waktu: ${remindAt}\n`;
    response += `⚠️ Prioritas: ${reminder.isPriority ? 'Ya' : 'Tidak'}\n\n`;
  });
  return response;
}

export { 
    formatTaskDueDate, 
    buildTaskReplyMessage, 
    buildDatabaseReplyMessage, 
    buildTaskCountReply, 
    buildTaskListReply,
    buildNewReminderReply,
    buildListReminderReply
};
