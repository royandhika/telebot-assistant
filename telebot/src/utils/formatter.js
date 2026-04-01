function formatTaskDueDate(dueDate) {
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    }).format(new Date(dueDate));
}

function buildTaskReplyMessage(newTask) {
    return `
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

export { formatTaskDueDate, buildTaskReplyMessage, buildDatabaseReplyMessage };
