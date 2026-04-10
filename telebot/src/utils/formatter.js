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
    return `
<b>🪪 ID:</b> ${newTask.id}
<b>🛠️ Project:</b> ${newTask.projectName}
<b>📝 Task:</b> ${newTask.title}
<b>📆 Deadline:</b> ${newTask.dueDate}
`
}

function buildDatabaseReplyMessage(newDb) {
    return `
<b>💾 Database udah ditambahkan</b>

<b>Host:</b> ${newDb.host}:${newDb.port}
<b>Database:</b> ${newDb.name}
<b>Username:</b> ${newDb.username}

Kamu bisa pakai database ini untuk pipeline barumu.
`
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
    const projectName = task.projects?.name || 'No Project';
    const dueDate = task.dueDate ? formatTaskDueDate(task.dueDate) : 'No Deadline';
    
    response += `${projectName}: <b>${task.title}</b>\n`;
    response += `📆 Deadline: ${dueDate}\n\n`;
  });
  return response;
}

export { 
    formatTaskDueDate, 
    buildTaskReplyMessage, 
    buildDatabaseReplyMessage, 
    buildTaskCountReply, 
    buildTaskListReply 
};
