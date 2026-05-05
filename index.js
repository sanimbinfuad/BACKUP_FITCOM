const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const mysql = require("mysql2");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 }
}));

app.set("view engine", "ejs");

// DB
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "fitness_tracker"
});

db.connect(err => {
    if (err) console.log(err);
    else console.log("MySQL connected");
});

// ADMIN MIDDLEWARE

function requireLogin(req, res, next) {
    if (!req.session.user) return res.redirect("/login");
    next();
}

const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.userType === "admin") {
        return next();
    }
    res.redirect("/login");
};

//routes

app.get("/", (req, res) => res.redirect("/login"));

app.get("/login", (req, res) => {
    res.render("login", { error: undefined });
});

app.get("/register", (req, res) => res.render("register"));

//register
app.post("/register", async (req, res) => {
    const { name, email, password, is_trainer } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (name, email, password, user_type, is_trainer) VALUES (?, ?, ?, 'user', ?)",
        [name, email, hashed, is_trainer || 0],
        () => res.redirect("/login")
    );
});

//login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return res.send("Database error");
        if (results.length === 0) return res.render("login", { error: "No account found" });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.render("login", { error: "Wrong password" });

        req.session.user = {
            userID: user.userID,
            name: user.name,
            email: user.email,
            userType: user.user_type
        };

        res.redirect(user.user_type === "admin" ? "/admin" : "/dashboard");
    });
});

//dashboard
app.get("/dashboard", (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    const userID = req.session.user.userID;
    
    if (!req.session.likedPosts) {
        req.session.likedPosts = [];
    }

    const postQuery = `
        SELECT post.p_id, post.content, post.like_count, post.time, users.name
        FROM post
        JOIN users ON post.userID = users.userID
        ORDER BY post.time DESC
    `;

    const workoutCountQuery = `
        SELECT COUNT(*) AS totalWorkouts
        FROM activity_log
        WHERE userID = ?
    `;

    const notificationQuery = `
        SELECT * FROM notifications 
        WHERE userID = ? AND is_read = 0
        ORDER BY created_at DESC
    `;

    const goalsQuery = `
    SELECT * FROM goals 
    WHERE userID = ? AND is_completed = 0
    ORDER BY target_date ASC
    `;
    

    //notifications
    db.query(notificationQuery, [userID], (errN, notifications) => {
        if (errN) {
            console.log("Notification error:", errN);
            notifications = [];
        }

        //posts
        db.query(postQuery, (errP, posts) => {
            if (errP) {
                console.log("Post error:", errP);
                posts = [];
            }

            // workouts
            db.query(workoutCountQuery, [userID], (errW, result) => {
                if (errW) {
                    console.log("Workout error:", errW);
                    return res.send("Error loading dashboard");
                }

                const workoutCount = result[0]?.totalWorkouts || 0;

                //goals
                db.query(goalsQuery, [userID], (errG, goals) => {
                    if (errG) {
                        console.log("Goals error:", errG);
                        goals = [];
                    }

                    db.query(
                        "SELECT COUNT(*) AS friendCount FROM friends WHERE f1UserID = ?",
                        [userID],
                        (errFr, frResult) => {

                        const friendCount = frResult?.[0]?.friendCount || 0;

                        db.query(
                            "SELECT ROUND(AVG(score), 1) AS rating, COUNT(*) AS ratingCount FROM rates WHERE t_userID = ?",
                            [userID],
                            (errR, ratingResult) => {

                                const ratingCount = ratingResult?.[0]?.ratingCount || 0;
                                const rating = ratingResult?.[0]?.rating || 0;

                                //trainer req
                                db.query(
                                    "SELECT COUNT(*) AS cnt FROM notifications WHERE userID = 8 AND message LIKE ? AND is_read = 0",
                                    [`%ID: ${userID}%requesting Trainer status%`],
                                    (errT, reqResult) => {

                                        const hasRequestedTrainer = (reqResult?.[0]?.cnt || 0) > 0;

                                        db.query(
                                            "SELECT streak FROM users WHERE userID = ?",
                                            [userID],
                                            (errS, streakResult) => {

                                                const streak = streakResult?.[0]?.streak || 0;

                                                db.query(
                                                    "SELECT COUNT(*) AS badgeCount FROM earns WHERE userID = ?",
                                                    [userID],
                                                    (errB, badgeResult) => {

                                                        const badgeCount = badgeResult?.[0]?.badgeCount || 0;

                                                        return res.render("dashboard", {
                                                            active: "dashboard",
                                                            user: req.session.user,
                                                            posts,
                                                            likedPosts: req.session.likedPosts,
                                                            workoutCount,
                                                            notifications,
                                                            goals,
                                                            friendCount,
                                                            rating,
                                                            ratingCount,
                                                            hasRequestedTrainer,
                                                            streak,
                                                            badgeCount
                                                        });
                                                    }
                                                )
                            
                                            });
                                        }
                                    );

                                }
                            );
                        }
                    );
                });
            });
        });
    });
});
//posting
app.post("/post", (req, res) => {
    const userID = req.session.user.userID;
    const { content } = req.body;

    db.query(
        "INSERT INTO post (userID, content) VALUES (?, ?)",
        [userID, content],
        () => res.redirect("/dashboard")
    );
});

//like
app.post("/like/:postId", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    const postId = req.params.postId;

    db.query(
        "UPDATE post SET like_count = like_count + 1 WHERE p_id = ?",
        [postId],
        () => res.redirect("/dashboard") 
    );
});

app.post("/add-friend", (req, res) => {
    const userID = req.session.user.userID;
    const friendID = req.body.friendID;
    const redirectTo = req.body.redirectTo || "/dashboard";

    //adding friend
    db.query(
        "INSERT IGNORE INTO friends (f1UserID, f2UserID) VALUES (?, ?)",
        [userID, friendID],
        () => {
            db.query(
                "INSERT IGNORE INTO friends (f1UserID, f2UserID) VALUES (?, ?)",
                [friendID, userID],
                () => res.redirect(redirectTo)
            );
        }
    );
});

app.post("/remove-friend", (req, res) => {
    const userID = req.session.user.userID;
    const friendID = req.body.friendID;
    const redirectTo = req.body.redirectTo || "/dashboard";

    //remove friend
    db.query(
        "DELETE FROM friends WHERE (f1UserID = ? AND f2UserID = ?) OR (f1UserID = ? AND f2UserID = ?)",
        [userID, friendID, friendID, userID],
        () => res.redirect(redirectTo)
    );
});



//report
app.post("/report-post", (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    const reporterID = req.session.user.userID;
    const { postID, reason } = req.body;

    db.query(
        "SELECT userID FROM post WHERE p_id = ?",
        [postID],
        (err, result) => {
            if (err || result.length === 0) return res.send("Post not found");

            const reportedUserID = result[0].userID;

            db.query(
                "INSERT INTO reports (adminID, reportedUserID, postID, reason) VALUES (?, ?, ?, ?)",
                [reporterID, reportedUserID, postID, reason],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.send("Error reporting post");
                    }

                    res.redirect("/dashboard");
                }
            );
        }
    );
});

// admin dashboard
app.get("/admin", requireAdmin, (req, res) => {
    //show users
    db.query("SELECT userID, name, email, user_type, status FROM users", (err, users) => {
        //show posts
        db.query(`SELECT post.p_id, post.content, post.time, users.name FROM post JOIN users ON post.userID = users.userID ORDER BY post.time DESC`, (err, posts) => {
            //show reports
            db.query(`SELECT r.*, u.name AS reportedName FROM reports r JOIN users u ON r.reportedUserID = u.userID WHERE r.status = 'pending' ORDER BY r.created_at DESC`, (err, reports) => {
                
                // pending trainers
                db.query("SELECT * FROM notifications WHERE message LIKE '%requesting Trainer status%' AND is_read = 0", (err, requests) => {
                    
                    const parsedRequests = requests.map(r => ({
                    userID: r.message.match(/\(ID: (\d+)\)/)?.[1],
                    name: r.message.match(/^(.+?) \(ID:/)?.[1],
                    notificationID: r.notificationID
                    }));

                    res.render("admin", {
                        users,
                        posts,
                        reports,
                        parsedRequests, 
                        user: req.session.user
                    });
                });
            });
        });
    });
});

// accept report
app.post("/admin/report/accept", requireAdmin, (req, res) => {
    const { reportID, postID } = req.body;

    db.query("SELECT userID FROM post WHERE p_id = ?", [postID], (err, result) => {
        if (err || result.length === 0) return res.send("Post not found");

        const userID = result[0].userID;

        db.query("DELETE FROM post WHERE p_id = ?", [postID]);

        db.query(
            "UPDATE reports SET status = 'accepted' WHERE reportID = ?",
            [reportID]
        );

        db.query(
            "INSERT INTO notifications (userID, message, is_read) VALUES (?, ?, 0)",
            [userID, "Your post was removed due to a report."]
        );

        res.redirect("/admin");
    });
});

// decline report
app.post("/admin/report/decline", requireAdmin, (req, res) => {
    const { reportID } = req.body;

    db.query(
        "SELECT reportedUserID FROM reports WHERE reportID = ?",
        [reportID],
        (err, result) => {
            if (err || result.length === 0) return res.send("Report not found");

            const userID = result[0].reportedUserID;

            db.query(
                "UPDATE reports SET status='declined' WHERE reportID=?",
                [reportID]
            );

            db.query(
                "INSERT INTO notifications (userID, message, is_read) VALUES (?, ?, 0)",
                [userID, "Your report was reviewed and declined."]
            );

            res.redirect("/admin");
        }
    );
});

//notif deletion
app.post("/notification/delete", (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    const userID = req.session.user.userID;
    req.session.user.user_type = req.session.user.userType;
    const id = req.body.id;

    db.query(
        "UPDATE notifications SET is_read = 1 WHERE notificationID = ? AND userID = ?",
        [id, userID],
        (err) => {
            if (err) {
                console.log(err);
                return res.send("Error deleting notification");
            }

            res.redirect("/dashboard");
        }
    );
});

// Activity Log
app.get("/activity_log", (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    const userID = req.session.user.userID;

    const workoutsQuery = "SELECT * FROM workout";

    const logsQuery = `
        SELECT a.log_id, a.duration, a.date, w.type, w.cal_burned_per_hour
        FROM activity_log a
        JOIN workout w ON a.w_id = w.w_id
        WHERE a.userID = ?
        ORDER BY a.date DESC
    `;

    db.query(workoutsQuery, (err, workouts) => {
        db.query(logsQuery, [userID], (err2, logs) => {
            res.render("activity_log", {
                active: "activity",
                workouts: workouts || [],
                logs: logs || []
            });
        });
    });
});

app.post("/activity_log", (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    const userID = req.session.user.userID;
    const { w_id, duration } = req.body;

    const sql = `
        INSERT INTO activity_log (userID, w_id, duration, date)
        VALUES (?, ?, ?, CURDATE())
    `;

    db.query(sql, [userID, w_id, duration], () => {
        res.redirect("/activity_log");
    });
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

app.get("/search", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    const q = req.query.q;
    const userID = req.session.user.userID;

    if (!q) return res.render("search", { 
        active: "search",
        users: [], 
        posts: [], 
        query: "", 
        friendIDs: [] 
    });

    // add friend or remove friend
    db.query(
        "SELECT f2UserID AS friendID FROM friends WHERE f1UserID = ? UNION SELECT f1UserID AS friendID FROM friends WHERE f2UserID = ?",
        [userID, userID],
        (errF, friendRows) => {
            const friendIDs = (friendRows || []).map(r => r.friendID);

            // search user
            db.query(
                `SELECT u.userID, u.name, u.user_type,
                    /* Simplified Rating: 1 person = 1 star, capped at 5 */
                    ROUND(AVG(r.score), 1) AS rating,
                    COUNT(r.r_userID) AS rating_count
                 FROM users u
                 LEFT JOIN rates r ON r.t_userID = u.userID
                 WHERE (u.name LIKE ? OR (? = 'trainer' AND u.user_type = 'trainer')) AND u.userID != ?
                 GROUP BY u.userID
                 /* Sort: Trainers show up first, then by rating */
                 ORDER BY CASE WHEN u.user_type = 'trainer' THEN 0 ELSE 1 END, rating DESC`,
                [`%${q}%`, q.toLowerCase(), userID],
                (err, users) => {
                    
                    // search post
                    db.query(
                        `SELECT post.p_id, post.content, post.like_count, post.time, users.name 
                         FROM post 
                         JOIN users ON post.userID = users.userID 
                         WHERE post.content LIKE ? 
                         ORDER BY post.time DESC`,
                        [`%${q}%`],
                        (err2, posts) => {
                            res.render("search", { 
                                active: "search",
                                users: users || [], 
                                posts: posts || [], 
                                query: q, 
                                friendIDs 
                            });
                        }
                    );
                }
            );
        }
    );
});

//goals
app.get("/goals", requireLogin, (req, res) => {
    const userID = req.session.user.userID;

    db.query(
        `SELECT * FROM goals 
         WHERE userID = ? 
         ORDER BY created_at DESC`,
        [userID],
        (err, goals) => {
            if (err) return res.send("Error loading goals");

            res.render("goals", {
                active: "goals",
                user: req.session.user,
                goals: goals || []
            });
        }
    );
});

//add goal
app.post("/goals/add", requireLogin, (req, res) => {
    const userID = req.session.user.userID;
    const { title, description, target_date } = req.body;

    if (!title || title.trim() === "") {
        return res.send("Goal title is required");
    }

    db.query(
        `INSERT INTO goals (userID, title, description, target_date) 
         VALUES (?, ?, ?, ?)`,
        [userID, title, description || null, target_date || null],
        (err) => {
            if (err) return res.send("Error adding goal: " + err.message);
            res.redirect("/goals");
        }
    );
});

// goal complete 
app.post("/goals/complete", requireLogin, (req, res) => {
    const userID = req.session.user.userID;
    const { goal_id } = req.body;

    // user can only update own goal
    db.query(
        `UPDATE goals SET status = 'completed' 
         WHERE goal_id = ? AND userID = ?`,
        [goal_id, userID],
        (err) => {
            if (err) return res.send("Error updating goal");
            res.redirect("/goals");
        }
    );
});

// delete goal
app.post("/goals/delete", requireLogin, (req, res) => {
    const userID = req.session.user.userID;
    const { goal_id } = req.body;

    // user only deletes own goal
    db.query(
        "DELETE FROM goals WHERE goal_id = ? AND userID = ?",
        [goal_id, userID],
        (err) => {
            if (err) return res.send("Error deleting goal");
            res.redirect("/goals");
        }
    );
});

//daily challenge
function getTodaysChallenge(callback) {
    const today = new Date().toISOString().split("T")[0];

    // check if today's challenge already exists
    db.query(
        "SELECT * FROM challenge_info WHERE date = ?",
        [today],
        (err, results) => {
            if (err) return callback(err, null);

        
            if (results.length > 0) return callback(null, results[0]);

            // random workout for daily challenge
            db.query(
                "SELECT * FROM workout ORDER BY RAND() LIMIT 1",
                (err, workouts) => {
                    if (err) return callback(err, null);

                    const workout = workouts[0];
                    const duration = Math.floor(Math.random() * (60 - 20 + 1)) + 20;
                    const goalText = `Complete ${duration} minutes of ${workout.type}`;

                    db.query(
                        "INSERT INTO challenge_info (name, date, goal) VALUES (?, ?, ?)",
                        [workout.type, today, goalText],
                        (err, insertResult) => {
                            if (err) return callback(err, null);

                            callback(null, {
                                c_id: insertResult.insertId,
                                name: workout.type,
                                date: today,
                                goal: goalText
                            });
                        }
                    );
                }
            );
        }
    );
}

// give badge
function checkAndAwardBadge(userID, streak, callback) {
    let badgeName = null;

    if (streak === 25)     badgeName = "Gold";
    else if (streak === 10) badgeName = "Silver";
    else if (streak === 5)  badgeName = "Bronze";

    if (!badgeName) return callback(null, null);

    const today = new Date().toISOString().split("T")[0];

    // check if already earned
    db.query(
        "SELECT * FROM earns WHERE userID = ? AND name = ?",
        [userID, badgeName],
        (err, results) => {
            if (err) return callback(err, null);
            if (results.length > 0) return callback(null, null);

            // insert into earns
            db.query(
                "INSERT INTO earns (userID, name, date) VALUES (?, ?, ?)",
                [userID, badgeName, today],
                (err) => {
                    if (err) return callback(err, null);

                    // post to community feed
                    const badgeEmoji = badgeName === "Gold" ? "🥇" : badgeName === "Silver" ? "🥈" : "🥉";

                    db.query(
                        "INSERT INTO post (userID, content) VALUES (?, ?)",
                        [userID, `${badgeEmoji} just earned a ${badgeName} badge with a ${streak} day streak!`],
                        (err) => {
                            if (err) return callback(err, null);

                            // notify user
                            db.query(
                                "INSERT INTO notifications (userID, message) VALUES (?, ?)",
                                [userID, `🏅 You earned a ${badgeName} badge for completing ${streak} daily challenges in a row!`],
                                (err) => {
                                    if (err) return callback(err, null);
                                    callback(null, badgeName);
                                }
                            );
                        }
                    );
                }
            );
        }
    );
}

// challenge
app.get("/challenge", requireLogin, (req, res) => {
    const userID = req.session.user.userID;

    getTodaysChallenge((err, challenge) => {
        if (err) return res.send("Error loading challenge: " + err.message);

        // check if user joined daily challenge
        db.query(
            "SELECT * FROM challenge WHERE userID = ? AND c_id = ?",
            [userID, challenge.c_id],
            (err, joined) => {
                if (err) return res.send("Error checking challenge");

                const alreadyCompleted = joined.length > 0;

                //streak
                db.query(
                    "SELECT streak FROM users WHERE userID = ?",
                    [userID],
                    (err, userResult) => {
                        if (err) return res.send("Error fetching streak");

                        // badge from earns table
                        db.query(
                            `SELECT earns.name, earns.date, badges.description
                             FROM earns
                             JOIN badges ON earns.name = badges.name
                             WHERE earns.userID = ?
                             ORDER BY earns.date DESC`,
                            [userID],
                            (err, badges) => {
                                if (err) return res.send("Error fetching badges");

                                // get recent challenge history
                                db.query(
                                    `SELECT challenge_info.name, challenge_info.goal,
                                            challenge_info.date
                                     FROM challenge
                                     JOIN challenge_info ON challenge.c_id = challenge_info.c_id
                                     WHERE challenge.userID = ?
                                     ORDER BY challenge_info.date DESC
                                     LIMIT 7`,
                                    [userID],
                                    (err, history) => {
                                        if (err) return res.send("Error fetching history");

                                        res.render("challenge", {
                                            active: "challenge",
                                            user: req.session.user,
                                            challenge,
                                            alreadyCompleted,
                                            streak: userResult[0].streak || 0,
                                            badges: badges || [],
                                            history: history || [],
                                            newBadge: req.query.newBadge || null
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
});

//complete challenge
app.post("/challenge/complete", requireLogin, (req, res) => {
    const userID = req.session.user.userID;

    getTodaysChallenge((err, challenge) => {
        if (err) return res.send("Error loading challenge");

        // check not already completed
        db.query(
            "SELECT * FROM challenge WHERE userID = ? AND c_id = ?",
            [userID, challenge.c_id],
            (err, existing) => {
                if (err) return res.send("Database error");
                if (existing.length > 0) return res.redirect("/challenge");

                // insert into challenge table
                db.query(
                    "INSERT INTO challenge (userID, c_id) VALUES (?, ?)",
                    [userID, challenge.c_id],
                    (err) => {
                        if (err) return res.send("Error completing challenge: " + err.message);

                        // increase streak
                        db.query(
                            "UPDATE users SET streak = streak + 1 WHERE userID = ?",
                            [userID],
                            (err) => {
                                if (err) return res.send("Error updating streak");

                                // get new streak
                                db.query(
                                    "SELECT streak FROM users WHERE userID = ?",
                                    [userID],
                                    (err, result) => {
                                        if (err) return res.send("Error fetching streak");

                                        const newStreak = result[0].streak;

                                        // check badge
                                        checkAndAwardBadge(userID, newStreak, (err, badgeEarned) => {
                                            if (err) return res.send("Error awarding badge");

                                            if (badgeEarned) {
                                                res.redirect("/challenge?newBadge=" + badgeEarned);
                                            } else {
                                                res.redirect("/challenge");
                                            }
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
});

app.get("/friends", requireLogin, (req, res) => {
    const userID = req.session.user.userID;
// friends list
    db.query(
        `SELECT u.userID, u.name, u.streak, u.user_type,
            ROUND(AVG(r.score), 1) AS rating,
            COUNT(r.r_userID) AS rating_count
        FROM users u
        JOIN friends f ON (f.f1UserID = ? AND f.f2UserID = u.userID)
            OR (f.f2UserID = ? AND f.f1UserID = u.userID)
        LEFT JOIN rates r ON r.t_userID = u.userID
        WHERE u.userID != ?
        GROUP BY u.userID`,
        [userID, userID, userID],
        (err, friends) => {
            if (err) return res.send("Error loading friends");
            res.render("friends", {
                active: "friends",
                user: req.session.user,
                friends: friends || []
            });
        }
    );
});
// chat page
app.get("/chat/:friendID", requireLogin, (req, res) => {
    const userID = req.session.user.userID;
    const friendID = parseInt(req.params.friendID);

    // verify they are actually friends
    db.query(
        "SELECT * FROM friends WHERE (f1UserID = ? AND f2UserID = ?) OR (f1UserID = ? AND f2UserID = ?)",
        [userID, friendID, friendID, userID],
        (err, rows) => {
            if (err || rows.length === 0) return res.redirect("/friends");

            // get friend's name
            db.query(
                "SELECT userID, name FROM users WHERE userID = ?",
                [friendID],
                (err2, friendRows) => {
                    if (err2 || friendRows.length === 0) return res.redirect("/friends");

                    // message history
                    db.query(
                        `SELECT m.sender, m.content, m.time, u.name
                         FROM message m
                         JOIN users u ON m.sender = u.userID
                         WHERE (m.sender = ? AND m.receiver = ?)
                            OR (m.sender = ? AND m.receiver = ?)
                         ORDER BY m.time ASC`,
                        [userID, friendID, friendID, userID],
                        (err3, messages) => {
                            if (err3) return res.send("Error loading chat");

                            res.render("chat", {
                                user: req.session.user,
                                friend: friendRows[0],
                                messages: messages || []
                            });
                        }
                    );
                }
            );
        }
    );
});

// post send message
app.post("/chat/:friendID", requireLogin, (req, res) => {
    const userID = req.session.user.userID;
    const friendID = parseInt(req.params.friendID);
    const { content } = req.body;

    if (!content || content.trim() === "") return res.redirect("/chat/" + friendID);
//Sendi a message
    db.query(
        "INSERT INTO message (sender, receiver, content) VALUES (?, ?, ?)",
        [userID, friendID, content.trim()],
        () => res.redirect("/chat/" + friendID)
    );
});
// rating trainer
app.post("/rate-trainer", requireLogin, (req, res) => {
    const userID = req.session.user.userID;
    const { trainerID, score } = req.body;
    const safeScore = Math.min(5, Math.max(0, parseInt(score) || 0));

    db.query(
        `INSERT INTO rates (t_userID, r_userID, score) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE score = ?`,
        [trainerID, userID, safeScore, safeScore],
        () => res.redirect("/friends")
    );
});
// trainer application
app.post("/apply-trainer", requireLogin, (req, res) => {
    const userID = req.session.user.userID;

    // Check if already applied
    db.query(
        "SELECT * FROM notifications WHERE message LIKE ? AND is_read = 0",
        [`%ID: ${userID}) is requesting Trainer status%`],
        (err, existing) => {

            if (existing && existing.length > 0) {
                return res.redirect("/dashboard");
            }

            // send admin request
            db.query(
                "INSERT INTO notifications (userID, message, is_read) VALUES (?, ?, 0)",
                [8, `${req.session.user.name} (ID: ${userID}) requesting Trainer status`],
                () => res.redirect("/dashboard")
            );
        }
    );
});


//approve trainer
app.post("/admin/trainer/approve", requireAdmin, (req, res) => {
    const { userID, notificationID } = req.body;

    //change from normal user to trainer
    db.query(
        "UPDATE users SET user_type = 'trainer' WHERE userID = ?",
        [userID],
        (err) => {
            if (err) return res.send("Error updating user role");

            db.query(
                "UPDATE notifications SET is_read = 1 WHERE notificationID = ?",
                [notificationID],
                () => {
                    // send notification to the user
                    db.query(
                        "INSERT INTO notifications (userID, message, is_read) VALUES (?, ?, 0)",
                        [userID, "Congratulations! Your request to become a Trainer has been approved."]
                    );
                    res.redirect("/admin");
                }
            );
        }
    );
});

//decline trainer
app.post("/admin/trainer/decline", requireAdmin, (req, res) => {
    const { userID, notificationID } = req.body;

    
    db.query(
        "UPDATE notifications SET is_read = 1 WHERE notificationID = ?",
        [notificationID],
        () => {

            // notify user
            db.query(
                "INSERT INTO notifications (userID, message, is_read) VALUES (?, ?, 0)",
                [userID, "Your request to become a Trainer has been declined."]
            );

            res.redirect("/admin");
        }
    );
});
app.get("/admin/user/:userID", requireAdmin, (req, res) => {
    const targetID = req.params.userID;

    db.query("SELECT userID, name, email, user_type, status FROM users WHERE userID = ?", [targetID], (err, users) => {
        if (err || users.length === 0) return res.send("User not found");
        const profile = users[0];

        db.query(
            "SELECT p_id, content, time FROM post WHERE userID = ? ORDER BY time DESC",
            [targetID],
            (err2, posts) => {
                if (err2) return res.send("Error loading posts");
                res.render("admin_user", { profile, posts, user: req.session.user });
            }
        );
    });
});
app.listen(3000, () => {
    console.log("http://localhost:3000");
});