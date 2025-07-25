document.addEventListener('DOMContentLoaded', function () {
    const noteInput = document.getElementById('noteInput');
    const dateInput = document.querySelector('input[type="date"]');
    const addButton = document.getElementById('addButton');
    const deleteAllBtn = document.getElementById('deleteallBtn');
    const notesList = document.getElementById('notesList');
    const notesContainer = document.querySelector('.notes-container');
    let noteCounter = 1;

    function formatDate(dateString) {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replaceAll('/', '/');
    }

    function saveNotesToStorage() {
        const notes = [];
        notesList.querySelectorAll('tr').forEach(row => {
            const note = {
                text: row.querySelector('.note-cell').textContent.trim(),
                date: row.querySelector('td:nth-child(3)').textContent.trim(),
                status: row.querySelector('td:nth-child(4) button').textContent.trim()
            };
            notes.push(note);
        });
        localStorage.setItem('todoNotes', JSON.stringify(notes));
    }

    function loadNotesFromStorage() {
        const savedNotes = JSON.parse(localStorage.getItem('todoNotes')) || [];
        savedNotes.forEach(note => {
            noteInput.value = note.text;
            if (note.date !== 'No date') {
                const [day, month, year] = note.date.split('/');
                dateInput.value = `${year}-${month}-${day}`;
            } else {
                dateInput.value = '';
            }
            addNote(note.status === 'Complete');
        });
    }

    function addNote(isComplete = false) {
        const noteText = noteInput.value.trim();
        const dueDate = formatDate(dateInput.value);

        if (!noteText) {
            alert('Masukkan catatan terlebih dahulu!');
            return;
        }

        const isLongNote = noteText.length > 40;

        const newRow = document.createElement('tr');
        newRow.className = 'hover:bg-base-200 transition-colors';
        newRow.innerHTML = `
            <th class="text-neutral-50">${noteCounter}</th>
            <td class="text-neutral-50 note-cell ${isLongNote ? 'whitespace-normal' : ''}">
                ${noteText}
            </td>
            <td class="text-neutral-50">${dueDate}</td>
            <td>
                <button class="btn btn-xs status-pending">Pending</button>
            </td>
            <td class="action-cell">
                <button class="btn btn-xs edit-btn">
                    <i class="fas fa-pencil"></i>
                </button>
                <button class="btn btn-xs complete-btn">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-xs delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        notesList.appendChild(newRow);
        noteInput.value = '';
        dateInput.value = '';
        noteInput.focus();
        noteCounter++;

        updateTableStyle();

        const completeBtn = newRow.querySelector('.complete-btn');
        const statusBtn = newRow.querySelector('td:nth-child(4) button');

        if (isComplete) {
            statusBtn.textContent = 'Complete';
            statusBtn.classList.remove('status-pending');
            statusBtn.classList.add('status-complete');
            completeBtn.classList.add('btn-disabled');
        }

        completeBtn.addEventListener('click', function () {
            if (statusBtn.textContent === 'Pending') {
                statusBtn.textContent = 'Complete';
                statusBtn.classList.remove('status-pending');
                statusBtn.classList.add('status-complete');
                this.classList.add('btn-disabled');
                saveNotesToStorage();
            }
            filterNotes(document.querySelector('.filter input[type="radio"]:checked').value);
        });

        const editBtn = newRow.querySelector('.edit-btn');
        editBtn.addEventListener('click', function () {
            const taskCell = newRow.querySelector('.note-cell');
            const currentText = taskCell.textContent;
            const newText = prompt('Edit task:', currentText);
            if (newText !== null && newText.trim() !== '') {
                taskCell.textContent = newText.trim();
                saveNotesToStorage();
            }
        });

        const deleteBtn = newRow.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function () {
            if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
                newRow.remove();
                updateNoteNumbers();
                updateTableStyle();
                saveNotesToStorage();
            }
        });

        saveNotesToStorage();
    }

    function updateNoteNumbers() {
        document.querySelectorAll('#notesList tr th:first-child').forEach((th, index) => {
            th.textContent = index + 1;
        });
        noteCounter = document.querySelectorAll('#notesList tr').length + 1;
    }

    function updateTableStyle() {
        const rowCount = notesList.querySelectorAll('tr').length;
        notesContainer.classList.toggle('compact', rowCount >= 5);
    }

    function deleteAllNotes() {
        if (notesList.children.length === 0) {
            alert('Tidak ada catatan untuk dihapus!');
            return;
        }

        if (confirm('Apakah Anda yakin ingin menghapus semua catatan?')) {
            notesList.innerHTML = '';
            noteCounter = 1;
            updateTableStyle();
            saveNotesToStorage();
        }
    }

    function filterNotes(filterType) {
        const rows = notesList.querySelectorAll('tr');

        rows.forEach(row => {
            const statusBtn = row.querySelector('td:nth-child(4) button');
            const status = statusBtn.textContent.toLowerCase();

            switch (filterType) {
                case 'all':
                    row.style.display = '';
                    break;
                case 'pending':
                    row.style.display = status === 'pending' ? '' : 'none';
                    break;
                case 'complete':
                    row.style.display = status === 'complete' ? '' : 'none';
                    break;
                default:
                    row.style.display = '';
            }
        });
    }

    addButton.addEventListener('click', () => addNote());
    noteInput.addEventListener('keypress', (e) => e.key === 'Enter' && addNote());
    deleteAllBtn.addEventListener('click', deleteAllNotes);

    document.querySelectorAll('.filter input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function () {
            filterNotes(this.value);
        });
    });

    document.querySelector('.filter input[type="reset"]').addEventListener('click', function () {
        document.querySelectorAll('.filter input[type="radio"]').forEach(radio => {
            radio.checked = radio.value === 'all';
        });
        filterNotes('all');
    });

    filterNotes('all');
    loadNotesFromStorage();
});