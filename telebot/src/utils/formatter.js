function formatTaskDueDate(dueDate) {
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    }).format(new Date(dueDate));
}

function buildTaskReplyMessage(replyParam) {
    return `
        <b>🛠️ PROJECT:</b> ${replyParam.projectName}
        <b>📝 TASK:</b> ${replyParam.title}
        <b>📆 DEADLINE:</b> ${replyParam.dueDate}
    `.replace(/^\s+/gm, '');
}

export { formatTaskDueDate, buildTaskReplyMessage };
