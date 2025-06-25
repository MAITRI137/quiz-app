// Dummy data for courses with instructor and thumbnail
const courses = [
  {
    id: 1,
    title: 'HTML Basics',
    instructor: 'Jane Doe',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80', // HTML code on screen
    description: 'Learn the basics of HTML.',
    lessons: [
      { id: 1, title: 'Introduction to HTML', video: 'https://www.youtube.com/embed/UB1O30fR-EE' },
      { id: 2, title: 'HTML Elements', video: 'https://www.youtube.com/embed/qz0aGYrrlhU' }
    ]
  },
  {
    id: 2,
    title: 'CSS Fundamentals',
    instructor: 'John Smith',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80', // CSS code on screen
    description: 'Master the fundamentals of CSS.',
    lessons: [
      { id: 1, title: 'CSS Basics', video: 'https://www.youtube.com/embed/yfoY53QXEnI' },
      { id: 2, title: 'Selectors & Properties', video: 'https://www.youtube.com/embed/1PnVor36_40' }
    ]
  },
  {
    id: 3,
    title: 'JavaScript Essentials',
    instructor: 'Alice Lee',
    thumbnail: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', // JavaScript code on screen
    description: 'Get started with JavaScript programming.',
    lessons: [
      { id: 1, title: 'JS Introduction', video: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
      { id: 2, title: 'Variables & Data Types', video: 'https://www.youtube.com/embed/hdI2bqOjy3c' },
      { id: 3, title: 'Functions', video: 'https://www.youtube.com/embed/8dWL3wF_OMw' }
    ]
  }
];

function getProgress(courseId) {
  const progress = JSON.parse(localStorage.getItem('progress') || '{}');
  return progress[courseId] || [];
}

function setProgress(courseId, lessonId) {
  const progress = JSON.parse(localStorage.getItem('progress') || '{}');
  if (!progress[courseId]) progress[courseId] = [];
  if (!progress[courseId].includes(lessonId)) progress[courseId].push(lessonId);
  localStorage.setItem('progress', JSON.stringify(progress));
}

function renderHome() {
  document.getElementById('main-content').innerHTML = `
    <h2>Welcome to the E-Learning Platform</h2>
    <div class="course-list">
      ${courses.slice(0,2).map(course => `
        <div class="course-card">
          <img src="${course.thumbnail}" alt="${course.title}" class="course-thumb" />
          <h3>${course.title}</h3>
          <p><strong>Instructor:</strong> ${course.instructor}</p>
          <button onclick="viewCourse(${course.id})">View Course</button>
        </div>
      `).join('')}
    </div>
  `;
}

let courseFilterValue = '';

function renderCoursesPage() {
  document.getElementById('main-content').innerHTML = `
    <h2>All Courses</h2>
    <input type="text" id="course-filter" placeholder="Filter courses..." style="margin-bottom:1rem;padding:0.5rem;width:100%;max-width:300px;" value="${courseFilterValue}" />
    <div class="course-list" id="course-list"></div>
  `;
  document.getElementById('course-filter').addEventListener('input', function(e) {
    courseFilterValue = e.target.value;
    renderCourseList(courseFilterValue);
  });
  renderCourseList(courseFilterValue);
}

function renderCourseList(filter = '') {
  let filteredCourses = courses;
  if (filter) {
    filteredCourses = courses.filter(course => course.title.toLowerCase().includes(filter.toLowerCase()));
  }
  let html = '';
  html += filteredCourses.map(course => {
    const completed = getProgress(course.id).length;
    const total = course.lessons.length;
    const percent = Math.round((completed / total) * 100);
    return `
      <div class="course-card">
        <img src="${course.thumbnail}" alt="${course.title}" class="course-thumb" />
        <h3>${course.title}</h3>
        <p><strong>Instructor:</strong> ${course.instructor}</p>
        <div class="progress-bar"><div class="progress" style="width:${percent}%"></div></div>
        <small>${completed} of ${total} lessons completed</small><br>
        <button onclick="viewCourse(${course.id})">View Course</button>
      </div>
    `;
  }).join('');
  document.getElementById('course-list').innerHTML = html;
}

function viewCourse(courseId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return;
  let html = `
    <h2>${course.title}</h2>
    <img src="${course.thumbnail}" alt="${course.title}" class="course-thumb" style="max-width:350px;display:block;margin-bottom:1rem;" />
    <p><strong>Instructor:</strong> ${course.instructor}</p>
    <p>${course.description}</p>
    <ul class="lesson-list">
  `;
  const completed = getProgress(courseId);
  course.lessons.forEach(lesson => {
    html += `<li>
      <button onclick="viewLesson(${courseId},${lesson.id})">${lesson.title}</button>
      ${completed.includes(lesson.id) ? '✅' : ''}
    </li>`;
  });
  const percent = Math.round((completed.length / course.lessons.length) * 100);
  html += `</ul>
    <div class="progress-bar"><div class="progress" style="width:${percent}%"></div></div>
    <small>${completed.length} of ${course.lessons.length} lessons completed</small><br>
    <button onclick="renderCoursesPage()">Back to Courses</button>
  `;
  document.getElementById('main-content').innerHTML = html;
}

function viewLesson(courseId, lessonId) {
  const course = courses.find(c => c.id === courseId);
  const lesson = course.lessons.find(l => l.id === lessonId);
  setProgress(courseId, lessonId);
  let html = `<h2>${lesson.title}</h2>
    <div class="video-container">
      <iframe src="${lesson.video}" frameborder="0" allowfullscreen></iframe>
    </div>
    <button onclick="viewCourse(${courseId})">Back to Course</button>`;
  document.getElementById('main-content').innerHTML = html;
}

function renderDashboard() {
  let html = '<h2>Your Dashboard</h2>';
  const enrolled = courses.filter(course => getProgress(course.id).length > 0);
  if (enrolled.length === 0) {
    html += '<p>You have not started any courses yet.</p>';
  } else {
    html += '<div class="course-list">';
    enrolled.forEach(course => {
      const completed = getProgress(course.id).length;
      const total = course.lessons.length;
      const percent = Math.round((completed / total) * 100);
      html += `<div class="course-card">
        <img src="${course.thumbnail}" alt="${course.title}" class="course-thumb" />
        <h3>${course.title}</h3>
        <p><strong>Instructor:</strong> ${course.instructor}</p>
        <div class="progress-bar"><div class="progress" style="width:${percent}%"></div></div>
        <small>${completed} of ${total} lessons completed</small><br>
        <button onclick="viewCourse(${course.id})">Continue Course</button>
      </div>`;
    });
    html += '</div>';
  }
  document.getElementById('main-content').innerHTML = html;
}

document.getElementById('nav-home').onclick = (e) => { e.preventDefault(); renderHome(); };
document.getElementById('nav-courses').onclick = (e) => { e.preventDefault(); renderCoursesPage(); };
document.getElementById('nav-progress').onclick = (e) => { e.preventDefault(); renderDashboard(); };

// Initial load
renderHome(); 