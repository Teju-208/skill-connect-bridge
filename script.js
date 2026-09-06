// ===============================
// NAVIGATION
// ===============================

function goToLogin() {
    window.location.href = "login.html";
}

function goToSignup() {
    window.location.href = "signup.html";
}


// ===============================
// EXPLORE PLATFORM
// ===============================

function scrollToFeatures() {

    const features =
        document.getElementById("features");

    if (features) {
        features.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// ===============================
// LOGIN
// ===============================

async function loginUser(event) {

    event.preventDefault();

    const emailElement =
        document.getElementById("loginEmail");

    const passwordElement =
        document.getElementById("loginPassword");

    const roleElement =
        document.getElementById("loginRole");

    const email =
        emailElement ? emailElement.value.trim() : "";

    const password =
        passwordElement ? passwordElement.value : "";

    const selectedRole =
        roleElement ? roleElement.value : "student";


    if (email === "" || password === "") {

        alert("Please fill in all fields.");

        return;
    }


    try {

        const response = await fetch(
            "/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password,
                    role: selectedRole
                })
            }
        );


        const data =
            await response.json();


        console.log(
            "Login response:",
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                "Login failed."
            );

            return;
        }


        if (!data.user) {

            alert(
                "Login successful, but user information was not returned."
            );

            return;
        }


        // ==========================================
        // VERIFY SELECTED ROLE
        // ==========================================

        const actualRole =
            data.user.role;


        if (
            actualRole &&
            actualRole !== selectedRole
        ) {

            alert(
                "This account is registered as " +
                actualRole +
                ". Please select the correct role."
            );

            return;
        }


        // ==========================================
        // SAVE USER INFORMATION
        // ==========================================

        localStorage.setItem(
            "userId",
            data.user.id
        );

        localStorage.setItem(
            "userName",
            data.user.name
        );

        localStorage.setItem(
            "userEmail",
            data.user.email
        );

        localStorage.setItem(
            "userRole",
            actualRole || selectedRole
        );

        localStorage.setItem(
            "skillbridgeUser",
            JSON.stringify(data.user)
        );


        alert(
            "Login successful!"
        );


        // ==========================================
        // ROLE BASED REDIRECTION
        // ==========================================

        if (
            selectedRole === "student"
        ) {

            window.location.href =
                "dashboard.html";

        }

        else if (
            selectedRole === "faculty"
        ) {

            window.location.href =
                "faculty.html";

        }

        else if (
            selectedRole === "university"
        ) {

            window.location.href =
                "university.html";

        }

        else if (
            selectedRole === "industry"
        ) {

            window.location.href =
                "industry.html";

        }

        else {

            window.location.href =
                "index.html";
        }


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        alert(
            "Cannot connect to SkillBridge server."
        );
    }
}


// ===============================
// CREATE ACCOUNT
// ===============================

async function createAccount(event) {

    event.preventDefault();


    const nameElement =
        document.getElementById("signupName");

    const emailElement =
        document.getElementById("signupEmail");

    const passwordElement =
        document.getElementById("signupPassword");

    const roleElement =
        document.getElementById("signupRole");


    const name =
        nameElement ?
        nameElement.value.trim() :
        "";

    const email =
        emailElement ?
        emailElement.value.trim() :
        "";

    const password =
        passwordElement ?
        passwordElement.value :
        "";

    const role =
        roleElement ?
        roleElement.value :
        "student";


    if (
        name === "" ||
        email === "" ||
        password === ""
    ) {

        alert(
            "Please fill in all fields."
        );

        return;
    }


    try {

        const response = await fetch(
            "/api/auth/signup",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    role: role
                })
            }
        );


        const data =
            await response.json();


        console.log(
            "Signup response:",
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                "Account creation failed."
            );

            return;
        }


        alert(
            "Account created successfully as " +
            role +
            "!"
        );


        window.location.href =
            "login.html";


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );

        alert(
            "Cannot connect to SkillBridge server."
        );
    }
}


// ===============================
// PROFILE
// ===============================

async function Profile() {

    const userId =
        localStorage.getItem("userId");

    if (!userId) {

        alert("Please login first.");

        return;
    }


    try {

        const response =
            await fetch(
                `/api/profile/${userId}`
            );


        const profile =
            await response.json();


        if (!response.ok) {

            alert(
                profile.message
            );

            return;
        }


        const fields = {

            profileName:
                profile.name,

            profileEmail:
                profile.email,

            profilePhone:
                profile.phone,

            profileLocation:
                profile.location,

            profileDegree:
                profile.degree ||
                "B.Tech",

            profileSpecialization:
                profile.specialization ||
                "Artificial Intelligence",

            profileCollege:
                profile.college,

            profileGraduation:
                profile.graduation_year ||
                "2029",

            targetCareer:
                profile.target_career ||
                "Software Developer",

            preferredIndustry:
                profile.preferred_industry ||
                "Information Technology"
        };


        Object.keys(fields).forEach(
            id => {

                const element =
                    document.getElementById(id);

                if (element) {

                    element.value =
                        fields[id] || "";
                }

            }
        );


    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

        alert(
            "Cannot connect to SkillBridge server."
        );
    }
}


// ===============================
// SAVE PROFILE
// ===============================

async function savePersonalProfile() {

    const userId =
        localStorage.getItem("userId");


    if (!userId) {

        alert(
            "Please login first."
        );

        return;
    }


    await saveProfileData(
        userId
    );
}


async function saveEducation() {

    const userId =
        localStorage.getItem("userId");


    if (!userId) {

        alert(
            "Please login first."
        );

        return;
    }


    await saveProfileData(
        userId
    );
}


async function saveProfileData(userId) {

    const phoneElement =
        document.getElementById(
            "profilePhone"
        );

    const locationElement =
        document.getElementById(
            "profileLocation"
        );

    const degreeElement =
        document.getElementById(
            "profileDegree"
        );

    const specializationElement =
        document.getElementById(
            "profileSpecialization"
        );

    const collegeElement =
        document.getElementById(
            "profileCollege"
        );

    const graduationElement =
        document.getElementById(
            "profileGraduation"
        );

    const careerElement =
        document.getElementById(
            "targetCareer"
        );

    const industryElement =
        document.getElementById(
            "preferredIndustry"
        );


    const data = {

        phone:
            phoneElement ?
            phoneElement.value :
            "",

        location:
            locationElement ?
            locationElement.value :
            "",

        degree:
            degreeElement ?
            degreeElement.value :
            "",

        specialization:
            specializationElement ?
            specializationElement.value :
            "",

        college:
            collegeElement ?
            collegeElement.value :
            "",

        graduation_year:
            graduationElement ?
            graduationElement.value :
            "",

        target_career:
            careerElement ?
            careerElement.value :
            "",

        preferred_industry:
            industryElement ?
            industryElement.value :
            ""
    };


    try {

        const response =
            await fetch(
                `/api/profile/${userId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message
            );

            return;
        }


        alert(
            "Profile saved successfully!"
        );


    } catch (error) {

        console.error(
            "Save profile error:",
            error
        );

        alert(
            "Cannot connect to SkillBridge server."
        );
    }
}


// ===============================
// SKILLS
// ===============================

async function loadSkills() {
    const userId = localStorage.getItem("userId");
    if (!userId) { window.location.href = "login.html"; return; }
    try {
        const [skillsResponse, aiResponse] = await Promise.all([
            fetch(`/api/skills/${userId}`),
            fetch(`/api/ai/analysis/${userId}`)
        ]);
        const skills = await skillsResponse.json();
        const ai = aiResponse.ok ? await aiResponse.json() : null;
        if (!skillsResponse.ok) throw new Error(skills.message || "Failed to load skills.");

        const overallScore = skills.length ? Math.round(skills.reduce((sum,s) => sum + (Number(s.skill_score)||0), 0) / skills.length) : 0;
        const strongSkills = skills.filter(s => Number(s.skill_score) >= 70).length;
        const improvingSkills = skills.filter(s => Number(s.skill_score) < 70).length;
        const skillGaps = ai ? ai.gaps.length : skills.filter(s => Number(s.skill_score) < 60).length;
        const statCards = document.querySelectorAll(".stats-grid .stat-card");
        if (statCards.length >= 4) {
            statCards[0].querySelector("strong").textContent = overallScore + "%";
            statCards[0].querySelector("p").textContent = ai ? `${ai.readiness}% career readiness` : "Overall skill level";
            statCards[1].querySelector("strong").textContent = strongSkills;
            statCards[2].querySelector("strong").textContent = improvingSkills;
            statCards[3].querySelector("strong").textContent = skillGaps;
        }
        skills.slice(0,5).forEach((skill,index) => {
            const n=index+1;
            const name=document.getElementById(`skillName${n}`), score=document.getElementById(`skillScore${n}`), bar=document.getElementById(`skillBar${n}`);
            if(name) name.textContent=skill.skill_name;
            if(score) score.textContent=(Number(skill.skill_score)||0)+"%";
            if(bar) bar.style.width=(Number(skill.skill_score)||0)+"%";
        });
        for(let i=skills.length+1;i<=5;i++){ const bar=document.getElementById(`skillBar${i}`); if(bar){const item=bar.closest('.progress-item'); if(item)item.style.display='none';}}

        const gapContainer=document.getElementById("aiSkillGapContainer");
        if(gapContainer && ai){
            gapContainer.innerHTML = `
                <div class="ai-summary"><strong>${escapeHtml(ai.career)}</strong><span>${ai.readiness}% career readiness</span></div>
                ${ai.gaps.length ? ai.gaps.slice(0,6).map(g=>`<div class="ai-gap-item"><div><strong>${escapeHtml(g.skill)}</strong><small>Current ${g.current}% · Target ${g.target}%</small></div><b>${g.gap}% gap</b></div>`).join('') : '<div class="ai-success">🎉 You are meeting the target level for all mapped career skills.</div>'}
            `;
        }
    } catch(error){ console.error("Skills page error:",error); alert("Cannot connect to SkillBridge server."); }
}

// ===============================
// OPPORTUNITIES
// ===============================

let allOpportunities = [];


async function loadOpportunities() {
    try {
        const userId = localStorage.getItem("userId");
        const url = userId ? `/api/ai/opportunities/${userId}` : "/api/opportunities";
        const response = await fetch(url);
        const opportunities = await response.json();
        if (!response.ok) throw new Error(opportunities.message || "Failed to load opportunities.");
        allOpportunities = opportunities;
        displayOpportunities(opportunities);
    } catch(error){ console.error("Opportunities error:",error); alert("Cannot connect to SkillBridge server."); }
}

function displayOpportunities(opportunities) {
    const container=document.getElementById("opportunitiesContainer");
    if(!container) return;
    container.innerHTML="";
    if(!opportunities.length){ container.innerHTML='<div class="dashboard-card"><h2>No opportunities found</h2><p>Try another search.</p></div>'; return; }
    opportunities.forEach(opportunity=>{
        const card=document.createElement("div"); card.className="dashboard-card";
        const score = opportunity.match_score;
        card.innerHTML=`
            <span class="small-label">${escapeHtml(opportunity.type || "OPPORTUNITY")}</span>
            ${score !== undefined ? `<div class="match-badge">🤖 ${score}% AI Match</div>` : ""}
            <h2>${escapeHtml(opportunity.title)}</h2>
            <p><strong>${escapeHtml(opportunity.company)}</strong></p>
            <p>📍 ${escapeHtml(opportunity.location || "Not specified")}</p>
            <p>💻 ${escapeHtml(opportunity.skills || "Skills not specified")}</p>
            <p>⏱ ${escapeHtml(opportunity.duration || "Not specified")}</p>
            ${opportunity.matched_skills?.length ? `<p class="ai-note">✓ Matched: ${escapeHtml(opportunity.matched_skills.join(', '))}</p>` : ""}
            ${opportunity.missing_skills?.length ? `<p class="ai-note">△ Improve: ${escapeHtml(opportunity.missing_skills.join(', '))}</p>` : ""}
            <button class="primary-btn" onclick="viewOpportunity('${escapeHtml(opportunity.title).replace(/'/g,"\\'")}')">View Opportunity</button>`;
        container.appendChild(card);
    });
}

function searchOpportunities() {

    const searchElement =
        document.getElementById(
            "opportunitySearch"
        );


    const typeElement =
        document.getElementById(
            "opportunityType"
        );


    if (
        !searchElement ||
        !typeElement
    ) {
        return;
    }


    const search =
        searchElement.value
            .toLowerCase()
            .trim();


    const type =
        typeElement.value;


    const filtered =
        allOpportunities.filter(
            opportunity => {

                const searchableText = `

                    ${opportunity.title}

                    ${opportunity.company}

                    ${opportunity.skills}

                    ${opportunity.location}

                `.toLowerCase();


                const matchesSearch =
                    search === "" ||
                    searchableText.includes(
                        search
                    );


                const matchesType =
                    type === "" ||
                    opportunity.type === type;


                return (
                    matchesSearch &&
                    matchesType
                );

            }
        );


    displayOpportunities(
        filtered
    );
}


function viewOpportunity(title) {

    alert(
        "Opening opportunity: " +
        title
    );
}


// ===============================
// LEARNING / COURSES
// ===============================

let allCourses = [];


async function loadCourses() {
    try {
        const userId=localStorage.getItem("userId");
        const url=userId ? `/api/ai/recommendations/${userId}` : "/api/courses";
        const response=await fetch(url);
        const courses=await response.json();
        if(!response.ok) throw new Error(courses.message || "Failed to load courses.");
        allCourses=courses;
        const count=document.getElementById("courseCount"); if(count) count.textContent=courses.length;
        const container=document.getElementById("coursesContainer"); if(!container) return;
        container.innerHTML="";
        courses.forEach(course=>{
            const card=document.createElement("div"); card.className="dashboard-card";
            card.innerHTML=`<div class="stat-icon">📚</div><span class="small-label">${escapeHtml(course.category||"LEARNING")}</span><h2>${escapeHtml(course.title)}</h2><p>${course.matched_skills?.length ? `Recommended for your gaps in <strong>${escapeHtml(course.matched_skills.join(', '))}</strong>.` : 'Build practical skills and improve your career readiness.'}</p><p>📚 ${escapeHtml(course.level||"Beginner")} &nbsp; | &nbsp; ⏱ ${escapeHtml(course.duration||"Flexible")}</p>${course.ai_score!==undefined?`<div class="ai-score">🤖 AI relevance: ${course.ai_score}%</div>`:''}<button class="primary-btn" onclick="startCourse('${escapeHtml(course.title).replace(/'/g,"\\'")}')">Start Learning</button>`;
            container.appendChild(card);
        });
        const path=document.getElementById("learningPathContainer");
        if(path && userId){
            const ai=await fetch(`/api/ai/analysis/${userId}`).then(r=>r.json()).catch(()=>null);
            if(ai){
                const gaps=ai.gaps.slice(0,4);
                path.innerHTML=gaps.length ? gaps.map((g,i)=>`<div class="recommendation"><h3>Step ${i+1} — ${escapeHtml(g.skill)}</h3><p>Current ${g.current}% · Target ${g.target}%. Focus on this skill before moving to the next priority.</p></div>`).join('') : '<div class="ai-success">🎉 No priority skill gaps detected for your selected career.</div>';
            }
        }
    } catch(error){ console.error("Learning error:",error); alert("Cannot connect to SkillBridge server."); }
}

function startCourse(title) {

    alert(
        "Course started: " +
        title
    );
}


// ===============================
// DASHBOARD
// ===============================

async function loadDashboard() {

    const userId =
        localStorage.getItem("userId");


    if (!userId) {

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

        return;
    }


    try {

        const profileResponse =
            await fetch(
                `/api/profile/${userId}`
            );


        const profile =
            await profileResponse.json();


        if (profileResponse.ok) {

            const welcome =
                document.getElementById(
                    "dashboardWelcome"
                );


            if (welcome) {

                welcome.textContent =
                    `Welcome to SkillBridge, ${profile.name} 👋`;
            }
        }


        const skillsResponse =
            await fetch(
                `/api/skills/${userId}`
            );


        const skills =
            await skillsResponse.json();


        if (!skillsResponse.ok) {

            throw new Error(
                "Failed to load skills."
            );
        }


        let totalScore = 0;


        skills.forEach(
            skill => {

                totalScore +=
                    Number(
                        skill.skill_score
                    ) || 0;

            }
        );


        const averageScore =
            skills.length > 0
                ? Math.round(
                    totalScore /
                    skills.length
                )
                : 0;


        const dashboardSkillScore =
            document.getElementById(
                "dashboardSkillScore"
            );


        const progressSkillScore =
            document.getElementById(
                "progressSkillScore"
            );


        if (dashboardSkillScore) {

            dashboardSkillScore.textContent =
                averageScore + "%";
        }


        if (progressSkillScore) {

            progressSkillScore.textContent =
                averageScore + "%";
        }


        const improvingSkills =
            skills.filter(
                skill =>
                    Number(
                        skill.skill_score
                    ) < 70
            );


        const progressImproving =
            document.getElementById(
                "progressImproving"
            );


        if (progressImproving) {

            progressImproving.textContent =
                improvingSkills.length;
        }


        const skillsContainer =
            document.getElementById(
                "dashboardSkills"
            );


        if (skillsContainer) {

            if (skills.length === 0) {

                skillsContainer.innerHTML =
                    "<p>No skills added yet.</p>";

            } else {

                skillsContainer.innerHTML =
                    skills
                        .slice(0, 4)
                        .map(
                            skill => `

                            <div class="skill-item">

                                <strong>
                                    ${skill.skill_name}
                                </strong>

                                <span>
                                    ${skill.skill_score}%
                                </span>

                            </div>

                        `
                        )
                        .join("");
            }
        }


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        alert(
            "Cannot load dashboard data. Please make sure the SkillBridge server is running."
        );
    }
}


// =====================================================
// FACULTY MODULE
// =====================================================


// ===============================
// FACULTY DASHBOARD STATS
// ===============================

async function loadFacultyStats() {

    try {

        const response =
            await fetch(
                "/api/faculty/stats"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load faculty statistics."
            );
        }


        console.log(
            "Faculty statistics:",
            data
        );


        const totalStudents =
            document.getElementById(
                "totalStudents"
            );


        const averageSkillScore =
            document.getElementById(
                "averageSkillScore"
            );


        const skillGaps =
            document.getElementById(
                "skillGaps"
            );


        const careerReady =
            document.getElementById(
                "careerReady"
            );


        if (totalStudents) {

            totalStudents.textContent =
                data.total_students ?? 0;
        }


        if (averageSkillScore) {

            averageSkillScore.textContent =
                (data.average_skill_score ?? 0) +
                "%";
        }


        if (skillGaps) {

            skillGaps.textContent =
                data.skill_gaps ?? 0;
        }


        if (careerReady) {

            careerReady.textContent =
                (data.career_ready_percentage ?? 0) +
                "%";
        }


        return data;


    } catch (error) {

        console.error(
            "Faculty stats error:",
            error
        );

        return null;
    }
}


// ===============================
// FACULTY STUDENTS
// ===============================

async function loadFacultyStudents() {

    try {

        const response =
            await fetch(
                "/api/faculty/students"
            );


        const students =
            await response.json();


        if (!response.ok) {

            throw new Error(
                students.message ||
                "Failed to load students."
            );
        }


        console.log(
            "Faculty students:",
            students
        );


        const container =
            document.querySelector(
                ".student-grid"
            );


        if (!container) {

            console.log(
                "Student grid not found."
            );

            return students;
        }


        // Remove hardcoded Student A/B/C/D
        container.innerHTML = "";


        if (
            !students ||
            students.length === 0
        ) {

            container.innerHTML = `

                <div class="student-card">

                    <div class="student-avatar">
                        ?
                    </div>

                    <h3>
                        No Students
                    </h3>

                    <p>
                        No student accounts are available yet.
                    </p>

                </div>

            `;

            return students;
        }


        students.forEach(
            student => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "student-card";


                const studentName =
                    student.name ||
                    "Student";


                const avatar =
                    studentName
                        .charAt(0)
                        .toUpperCase();


                const score =
                    Number(
                        student.average_skill_score
                    ) || 0;


                card.innerHTML = `

                    <div class="student-avatar">
                        ${avatar}
                    </div>

                    <h3>
                        ${studentName}
                    </h3>

                    <p>
                        Overall Skill Score
                    </p>

                    <strong>
                        ${score}%
                    </strong>

                    <div class="mini-progress">

                        <div
                            style="width:${score}%">
                        </div>

                    </div>

                    <p>
                        ${student.email || ""}
                    </p>

                    <button
                        onclick="viewFacultyStudent(${student.id})">

                        View Profile →

                    </button>

                `;


                container.appendChild(
                    card
                );

            }
        );


        return students;


    } catch (error) {

        console.error(
            "Faculty students error:",
            error
        );

        return [];
    }
}


// ===============================
// VIEW SINGLE STUDENT
// ===============================

async function viewFacultyStudent(
    studentId
) {

    try {

        const response =
            await fetch(
                `/api/faculty/students/${studentId}`
            );


        const student =
            await response.json();


        if (!response.ok) {

            alert(
                student.message ||
                "Unable to load student."
            );

            return;
        }


        const profile =
            student.profile || {};


        const skills =
            student.skills || [];


        const skillsText =
            skills.length > 0
                ? skills
                    .map(
                        skill =>
                            `${skill.skill_name}: ${skill.skill_score}%`
                    )
                    .join("\n")
                : "No skills available.";


        alert(

            `Student: ${
                profile.name ||
                "Not specified"
            }\n\n` +

            `Email: ${
                profile.email ||
                "Not specified"
            }\n` +

            `Degree: ${
                profile.degree ||
                "Not specified"
            }\n` +

            `Specialization: ${
                profile.specialization ||
                "Not specified"
            }\n` +

            `College: ${
                profile.college ||
                "Not specified"
            }\n` +

            `Career: ${
                profile.target_career ||
                "Not specified"
            }\n\n` +

            `Skills:\n${skillsText}\n\n` +

            `Average Score: ${
                student.average_skill_score ||
                0
            }%`

        );


    } catch (error) {

        console.error(
            "View student error:",
            error
        );

        alert(
            "Cannot load student information."
        );
    }
}


// ===============================
// FACULTY PERFORMANCE
// ===============================

async function loadFacultyPerformance() {

    try {

        const response =
            await fetch(
                "/api/faculty/performance"
            );


        const performance =
            await response.json();


        if (!response.ok) {

            throw new Error(
                performance.message ||
                "Failed to load performance."
            );
        }


        console.log(
            "Faculty performance:",
            performance
        );


        // ------------------------------------------
        // UPDATE PERFORMANCE CARD
        // ------------------------------------------

        const container =
            document.querySelector(
                ".performance-card"
            );


        if (
            container &&
            Array.isArray(performance) &&
            performance.length > 0
        ) {

            container.innerHTML = "";


            performance.forEach(
                item => {

                    const skillName =
                        item.skill_name ||
                        item.skill ||
                        "Skill";


                    const score =
                        Number(
                            item.average_score ??
                            item.skill_score ??
                            item.score
                        ) || 0;


                    const performanceItem =
                        document.createElement(
                            "div"
                        );


                    performanceItem.className =
                        "performance-item";


                    performanceItem.innerHTML = `

                        <div class="performance-top">

                            <span>
                                ${skillName}
                            </span>

                            <strong>
                                ${score}%
                            </strong>

                        </div>

                        <div class="faculty-progress">

                            <div
                                style="width:${score}%">
                            </div>

                        </div>

                    `;


                    container.appendChild(
                        performanceItem
                    );

                }
            );
        }


        return performance;


    } catch (error) {

        console.error(
            "Faculty performance error:",
            error
        );

        return [];
    }
}


// ===============================
// FACULTY SKILL GAPS
// ===============================

async function loadFacultySkillGaps() {

    try {

        const response =
            await fetch(
                "/api/faculty/skill-gaps"
            );


        const gaps =
            await response.json();


        if (!response.ok) {

            throw new Error(
                gaps.message ||
                "Failed to load skill gaps."
            );
        }


        console.log(
            "Faculty skill gaps:",
            gaps
        );


        // ------------------------------------------
        // UPDATE SKILL GAP CARDS
        // ------------------------------------------

        const container =
            document.querySelector(
                ".gap-grid"
            );


        if (
            container &&
            Array.isArray(gaps) &&
            gaps.length > 0
        ) {

            container.innerHTML = "";


            gaps.forEach(
                gap => {

                    const skillName =
                        gap.skill_name ||
                        gap.skill ||
                        "Skill";


                    const studentsCount =
                        Number(
                            gap.students_needing_improvement ??
                            gap.student_count ??
                            gap.count
                        ) || 0;


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "gap-card";


                    let icon =
                        "📌";


                    const lowerName =
                        skillName.toLowerCase();


                    if (
                        lowerName.includes(
                            "machine"
                        )
                    ) {

                        icon = "🤖";

                    } else if (
                        lowerName.includes(
                            "sql"
                        )
                    ) {

                        icon = "🗄️";

                    } else if (
                        lowerName.includes(
                            "communication"
                        )
                    ) {

                        icon = "💬";
                    }


                    card.innerHTML = `

                        <div class="gap-icon">
                            ${icon}
                        </div>

                        <div>

                            <h3>
                                ${skillName}
                            </h3>

                            <p>
                                ${studentsCount}
                                students need improvement
                            </p>

                        </div>

                        <span>
                            ${studentsCount}
                        </span>

                    `;


                    container.appendChild(
                        card
                    );

                }
            );
        }


        return gaps;


    } catch (error) {

        console.error(
            "Faculty skill gap error:",
            error
        );

        return [];
    }
}


// ===============================
// FACULTY INITIALIZATION
// ===============================

async function loadFacultyPage() {

    console.log(
        "Loading Faculty Dashboard..."
    );


    await loadFacultyStats();


    await loadFacultyStudents();


    await loadFacultyPerformance();


    await loadFacultySkillGaps();


    console.log(
        "Faculty Dashboard loaded."
    );
}


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        // PROFILE

        if (
            currentPage ===
            "profile.html"
        ) {

            Profile();
        }


        // SKILLS

        if (
            currentPage ===
            "skills.html"
        ) {

            loadSkills();
        }


        // OPPORTUNITIES

        if (
            currentPage ===
            "opportunities.html"
        ) {

            loadOpportunities();
        }


        // LEARNING

        if (
            currentPage ===
            "learning.html"
        ) {

            loadCourses();
        }


        // DASHBOARD

        if (
            currentPage ===
            "dashboard.html"
        ) {

            loadDashboard();
        }


        // FACULTY

        if (
            currentPage ===
            "faculty.html"
        ) {

            loadFacultyPage();
        }

    }
);


// ===============================
// LOGOUT
// ===============================

function logoutUser() {

    localStorage.removeItem(
        "userId"
    );

    localStorage.removeItem(
        "userName"
    );

    localStorage.removeItem(
        "userEmail"
    );

    localStorage.removeItem(
        "userRole"
    );

    localStorage.removeItem(
        "skillbridgeUser"
    );


    window.location.href =
        "login.html";
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\'":"&#39;"}[ch]));
}

// ============================================================
// RESUME / NLP SKILL EXTRACTION
// ============================================================

async function analyzeResume() {
    const userId = localStorage.getItem("userId");
    const fileInput = document.getElementById("resumeFile");
    const status = document.getElementById("resumeStatus");
    const detected = document.getElementById("detectedSkills");
    const button = document.getElementById("analyzeResumeBtn");

    if (!userId) {
        alert("Please login first.");
        return;
    }

    if (!fileInput || !fileInput.files.length) {
        alert("Please select your resume first.");
        return;
    }

    const file = fileInput.files[0];
    const allowed = /\.(pdf|txt)$/i.test(file.name);

    if (!allowed) {
        alert("Please upload a PDF or TXT resume.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Resume must be 5 MB or smaller.");
        return;
    }

    status.textContent = "Analyzing resume...";
    detected.innerHTML = "";
    button.disabled = true;

    try {
        const fileData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Could not read the resume."));
            reader.readAsDataURL(file);
        });

        const response = await fetch(
            "/api/resume/analyze",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId,
                    fileName: file.name,
                    fileData
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Resume analysis failed.");
        }

        status.textContent = result.message;

        if (result.skills && result.skills.length) {
            detected.innerHTML = `
                <strong>Detected Skills:</strong>
                <div style="margin-top:8px;">
                    ${result.skills.map(skill =>
                        `<span style="display:inline-block; margin:4px; padding:6px 10px; border-radius:16px; background:#f1f5f9;">${skill}</span>`
                    ).join("")}
                </div>
            `;
        }

        // Refresh profile/skills data after extraction.
        if (typeof loadSkills === "function") {
            await loadSkills();
        }

    } catch (error) {
        console.error("Resume analysis error:", error);
        status.textContent = error.message || "Resume analysis failed.";
    } finally {
        button.disabled = false;
    }
}
