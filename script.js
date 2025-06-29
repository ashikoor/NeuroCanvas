
        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize canvas and elements
            const canvas = document.getElementById('canvas');
            const newNoteBtn = document.getElementById('newNoteBtn');
            const zoomInBtn = document.getElementById('zoomInBtn');
            const zoomOutBtn = document.getElementById('zoomOutBtn');
            const resetBtn = document.getElementById('resetBtn');
            
            // Create magical cursor effect
            const cursor = document.querySelector('.magic-cursor');
            const cursorGlow = document.querySelector('.magic-cursor-glow');
            
            let currentScale = 1;
            let noteCount = 0;
            let activeNote = null;
            let isDragging = false;
            let dragOffset = { x: 0, y: 0 };
            
            // Initialize cursor position
            document.addEventListener('mousemove', (e) => {
                cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
                cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
                
                // Add sparkle effect occasionally
                if (Math.random() > 0.95) {
                    createSparkle(e.clientX, e.clientY);
                }
            });
            
            // Create sparkle effect at position
            function createSparkle(x, y) {
                const sparkle = document.createElement('div');
                sparkle.innerHTML = '✨';
                sparkle.style.position = 'fixed';
                sparkle.style.left = `${x}px`;
                sparkle.style.top = `${y}px`;
                sparkle.style.pointerEvents = 'none';
                sparkle.style.fontSize = `${Math.random() * 20 + 10}px`;
                sparkle.style.opacity = '0.8';
                sparkle.style.transform = 'translate(-50%, -50%)';
                sparkle.style.zIndex = '9999';
                sparkle.style.transition = 'all 1s ease';
                
                document.body.appendChild(sparkle);
                
                // Animate sparkle
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 100 + 50;
                
                setTimeout(() => {
                    sparkle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
                    sparkle.style.opacity = '0';
                }, 10);
                
                // Remove after animation
                setTimeout(() => {
                    document.body.removeChild(sparkle);
                }, 1000);
            }
            
            // Create a new sticky note
            function createStickyNote() {
                noteCount++;
                const noteId = `note-${noteCount}`;
                const noteColors = ['note-yellow', 'note-blue', 'note-green', 'note-purple'];
                const color = noteColors[Math.floor(Math.random() * noteColors.length)];
                
                const note = document.createElement('div');
                note.className = `sticky-note ${color}`;
                note.id = noteId;
                
                // Position note in the center initially
                const canvasRect = canvas.getBoundingClientRect();
                const x = (canvasRect.width / 2) - 110;
                const y = (canvasRect.height / 2) - 110;
                
                note.style.left = `${x}px`;
                note.style.top = `${y}px`;
                
                note.innerHTML = `
                    <div class="note-header">
                        <div class="note-title" contenteditable="true">Note ${noteCount}</div>
                        <div class="note-actions">
                            <button class="note-action-btn" data-action="color"><i class="fas fa-palette"></i></button>
                            <button class="note-action-btn" data-action="delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="note-content" contenteditable="true">Start typing your thoughts here...</div>
                `;
                
                canvas.appendChild(note);
                
                // Add event listeners for note interactions
                addNoteEventListeners(note);
                
                return note;
            }
            
            // Add event listeners to a note
            function addNoteEventListeners(note) {
                const header = note.querySelector('.note-header');
                const deleteBtn = note.querySelector('[data-action="delete"]');
                const colorBtn = note.querySelector('[data-action="color"]');
                
                // Make note draggable
                header.addEventListener('mousedown', startDrag);
                
                // Delete note
                deleteBtn.addEventListener('click', () => {
                    note.style.opacity = '0';
                    note.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        canvas.removeChild(note);
                    }, 300);
                });
                
                // Change color
                colorBtn.addEventListener('click', () => {
                    const noteColors = ['note-yellow', 'note-blue', 'note-green', 'note-purple'];
                    const currentColor = Array.from(note.classList).find(cls => cls.startsWith('note-'));
                    const currentIndex = noteColors.indexOf(currentColor);
                    const nextIndex = (currentIndex + 1) % noteColors.length;
                    
                    note.classList.remove(currentColor);
                    note.classList.add(noteColors[nextIndex]);
                    
                    // Add animation effect
                    note.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        note.style.transform = 'scale(1)';
                    }, 200);
                });
            }
            
            // Drag functionality
            function startDrag(e) {
                if (e.target.closest('.note-action-btn')) return;
                
                activeNote = e.currentTarget.closest('.sticky-note');
                isDragging = true;
                
                const rect = activeNote.getBoundingClientRect();
                dragOffset = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
                
                activeNote.style.cursor = 'grabbing';
                activeNote.style.zIndex = '100';
                document.addEventListener('mousemove', dragNote);
                document.addEventListener('mouseup', stopDrag);
            }
            
            function dragNote(e) {
                if (!isDragging || !activeNote) return;
                
                const canvasRect = canvas.getBoundingClientRect();
                let x = e.clientX - dragOffset.x - canvasRect.left;
                let y = e.clientY - dragOffset.y - canvasRect.top;
                
                // Boundary constraints
                x = Math.max(0, Math.min(canvasRect.width - activeNote.offsetWidth, x));
                y = Math.max(0, Math.min(canvasRect.height - activeNote.offsetHeight, y));
                
                activeNote.style.left = `${x}px`;
                activeNote.style.top = `${y}px`;
            }
            
            function stopDrag() {
                isDragging = false;
                if (activeNote) {
                    activeNote.style.cursor = 'grab';
                    activeNote.style.zIndex = '10';
                    activeNote = null;
                }
                document.removeEventListener('mousemove', dragNote);
                document.removeEventListener('mouseup', stopDrag);
            }
            
            // Zoom functionality
            function zoomCanvas(direction) {
                if (direction === 'in') {
                    currentScale = Math.min(2, currentScale + 0.1);
                } else if (direction === 'out') {
                    currentScale = Math.max(0.5, currentScale - 0.1);
                }
                
                canvas.style.transform = `scale(${currentScale})`;
                canvas.style.transformOrigin = 'center';
            }
            
            function resetCanvas() {
                currentScale = 1;
                canvas.style.transform = 'scale(1)';
                
                // Reset all notes to center
                const notes = document.querySelectorAll('.sticky-note');
                const canvasRect = canvas.getBoundingClientRect();
                
                notes.forEach((note, index) => {
                    const x = (canvasRect.width / 2) - 110 + (index * 30);
                    const y = (canvasRect.height / 2) - 110 + (index * 30);
                    
                    note.style.left = `${x}px`;
                    note.style.top = `${y}px`;
                    note.style.transform = 'translate(0, 0) scale(1)';
                });
            }
            
            // Event listeners for toolbar buttons
            newNoteBtn.addEventListener('click', createStickyNote);
            zoomInBtn.addEventListener('click', () => zoomCanvas('in'));
            zoomOutBtn.addEventListener('click', () => zoomCanvas('out'));
            resetBtn.addEventListener('click', resetCanvas);
            
            // Create initial notes
            setTimeout(() => {
                createStickyNote();
                setTimeout(() => {
                    createStickyNote();
                }, 200);
            }, 500);
        });
