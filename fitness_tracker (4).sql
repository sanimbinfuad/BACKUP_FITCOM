

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";




CREATE TABLE `activity_log` (
  `log_id` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `w_id` int(11) NOT NULL,
  `duration` float NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `activity_log` (`log_id`, `userID`, `w_id`, `duration`, `date`) VALUES
(1, 4, 8, 120, '2026-05-02'),
(2, 4, 10, 100, '2026-05-02'),
(3, 4, 1, 70, '2026-05-02'),
(4, 6, 10, 120, '2026-05-02'),
(5, 7, 5, 90, '2026-05-02'),
(6, 6, 8, 120, '2026-05-03'),
(7, 6, 3, 120, '2026-05-04'),
(8, 10, 2, 40, '2026-05-04');



CREATE TABLE `badges` (
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `badges` (`name`, `description`) VALUES
('Bronze', 'Complete 5 daily challenges in a row'),
('Gold', 'Complete 25 daily challenges in a row'),
('Silver', 'Complete 10 daily challenges in a row');



CREATE TABLE `challenge` (
  `userID` int(11) NOT NULL,
  `c_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `challenge` (`userID`, `c_id`) VALUES
(6, 3),
(9, 3),
(10, 2);



CREATE TABLE `challenge_info` (
  `c_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `goal` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `challenge_info` (`c_id`, `name`, `date`, `goal`) VALUES
(1, 'Yoga', '2026-05-03', 'Complete 35 minutes of Yoga'),
(2, 'Walking', '2026-05-04', 'Complete 26 minutes of Walking'),
(3, 'Yoga', '2026-05-05', 'Complete 20 minutes of Yoga');



CREATE TABLE `earns` (
  `userID` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `earns` (`userID`, `name`, `date`) VALUES
(6, 'Bronze', '2026-05-05'),
(9, 'Gold', '2026-05-05'),
(9, 'Silver', '2026-05-05');



CREATE TABLE `friends` (
  `f1UserID` int(11) NOT NULL,
  `f2UserID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `friends` (`f1UserID`, `f2UserID`) VALUES
(1, 10),
(3, 10),
(4, 6),
(4, 10),
(5, 6),
(5, 7),
(5, 10),
(6, 4),
(6, 5),
(6, 7),
(6, 10),
(7, 5),
(7, 6),
(7, 10),
(9, 10),
(10, 1),
(10, 3),
(10, 4),
(10, 5),
(10, 6),
(10, 7),
(10, 9);



CREATE TABLE `goals` (
  `goal_id` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `target_date` date DEFAULT NULL,
  `is_completed` tinyint(4) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT 'in_progress'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `goals` (`goal_id`, `userID`, `title`, `description`, `target_date`, `is_completed`, `created_at`, `status`) VALUES
(1, 6, 'sleep at 10pm', NULL, '2026-05-04', 0, '2026-05-04 03:36:38', 'in_progress'),
(2, 10, 'Run 1 km', NULL, '2026-05-04', 0, '2026-05-04 17:06:20', 'in_progress'),
(3, 10, 'Run 1 km without stoopping', NULL, NULL, 0, '2026-05-04 17:06:41', 'in_progress'),
(4, 6, 'jogging', NULL, '2026-05-06', 0, '2026-05-05 01:10:16', 'in_progress'),
(5, 6, 'eating', 'eating healthy', '2026-05-05', 0, '2026-05-05 05:49:11', 'in_progress'),
(6, 9, 'sleep at 10pm', NULL, '2026-05-05', 0, '2026-05-05 05:56:55', 'completed');



CREATE TABLE `message` (
  `sender` int(11) NOT NULL,
  `receiver` int(11) NOT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp(),
  `content` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `message` (`sender`, `receiver`, `time`, `content`) VALUES
(6, 4, '2026-05-04 06:03:56', 'hey bro when are you hitting the gym?'),
(6, 7, '2026-05-04 06:05:45', 'HI'),
(6, 7, '2026-05-04 06:30:04', '🔥🔥'),
(7, 5, '2026-05-04 06:07:25', 'hi bro'),
(7, 6, '2026-05-04 06:26:49', 'hello'),
(7, 6, '2026-05-04 06:30:33', '💪💪'),
(9, 10, '2026-05-04 12:57:55', 'yo! you should cp'),
(9, 10, '2026-05-04 12:58:05', 'watch*'),
(10, 5, '2026-05-04 11:08:54', '💪👍🎉');



CREATE TABLE `notifications` (
  `notificationID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `notifications` (`notificationID`, `userID`, `message`, `is_read`, `created_at`) VALUES
(1, 4, 'Your post was removed due to a report.', 0, '2026-05-04 01:33:01'),
(2, 6, 'Your post was removed due to a report.', 1, '2026-05-04 01:33:15'),
(3, 7, 'Your report was reviewed and declined.', 0, '2026-05-04 04:23:49'),
(4, 6, 'Your post was removed due to a report.', 1, '2026-05-04 04:23:56'),
(5, 1, 'TRAINER_REQUEST:6', 0, '2026-05-04 13:48:31'),
(6, 1, 'User ID 6 is requesting Trainer status', 1, '2026-05-04 14:18:42'),
(7, 1, 'User ID 6 is requesting Trainer status', 1, '2026-05-04 14:18:45'),
(8, 1, 'User ID 6 is requesting Trainer status', 1, '2026-05-04 14:18:46'),
(9, 1, 'User ID 6 is requesting Trainer status', 1, '2026-05-04 14:18:54'),
(10, 1, 'Congratulations! Your request to become a Trainer has been approved.', 0, '2026-05-04 14:35:23'),
(11, 1, 'Congratulations! Your request to become a Trainer has been approved.', 0, '2026-05-04 14:36:02'),
(12, 1, 'Congratulations! Your request to become a Trainer has been approved.', 0, '2026-05-04 14:36:05'),
(13, 1, 'Congratulations! Your request to become a Trainer has been approved.', 0, '2026-05-04 14:36:07'),
(14, 8, 'User ID 6 is requesting Trainer status', 1, '2026-05-04 14:45:13'),
(15, 8, 'User ID 6 is requesting Trainer status', 1, '2026-05-04 14:45:14'),
(16, 8, 'Congratulations! Your request to become a Trainer has been approved.', 0, '2026-05-04 14:45:50'),
(17, 8, 'Congratulations! Your request to become a Trainer has been approved.', 0, '2026-05-04 14:45:54'),
(18, 8, 'User ID 6 is requesting Trainer status', 1, '2026-05-04 14:49:01'),
(19, 8, 'User ID 6 is requesting Trainer status', 1, '2026-05-04 14:50:39'),
(20, 8, 'User ID 6 is requesting Trainer status', 1, '2026-05-04 14:50:41'),
(21, 6, 'Congratulations! Your request to become a Trainer has been approved.', 1, '2026-05-04 14:57:04'),
(22, 6, 'Congratulations! Your request to become a Trainer has been approved.', 1, '2026-05-04 14:57:07'),
(23, 6, 'Congratulations! Your request to become a Trainer has been approved.', 1, '2026-05-04 14:57:09'),
(24, 8, 'User ID 10 is requesting Trainer status', 1, '2026-05-04 17:09:34'),
(25, 10, 'Congratulations! Your request to become a Trainer has been approved.', 0, '2026-05-04 17:10:49'),
(26, 8, 'zawad ibn shams (ID: 9) is requesting Trainer status', 1, '2026-05-04 17:17:06'),
(27, 9, 'Congratulations! Your request to become a Trainer has been approved.', 1, '2026-05-04 17:24:56'),
(28, 6, '🏅 You earned a Bronze badge for completing 5 daily challenges in a row!', 0, '2026-05-05 06:47:51'),
(29, 9, '🏅 You earned a Silver badge for completing 10 daily challenges in a row!', 0, '2026-05-05 06:51:54'),
(30, 9, '🏅 You earned a Gold badge for completing 25 daily challenges in a row!', 0, '2026-05-05 06:53:32');



CREATE TABLE `post` (
  `p_id` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `content` text NOT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp(),
  `like_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `post` (`p_id`, `userID`, `content`, `time`, `like_count`) VALUES
(7, 5, 'Had a great workout today!! Went swimming and played football. If anyone wishes to join please let me know!!', '2026-05-01 21:16:25', 2),
(10, 7, 'Insane chest workout today, hit a 200kg bench press PR!! BEST FEELING EVER :))', '2026-05-01 21:28:08', 1),
(12, 6, 'Im trying sleep early from now on. Wish me luck!', '2026-05-03 21:40:31', 2),
(13, 10, 'I\'m gonna run 1 km without stopping', '2026-05-04 11:08:36', 1),
(14, 6, '🥉 just earned a Bronze badge with a 5 day streak!', '2026-05-05 00:47:51', 0),
(15, 9, '🥈 just earned a Silver badge with a 10 day streak!', '2026-05-05 00:51:54', 0),
(16, 9, '🥇 just earned a Gold badge with a 25 day streak!', '2026-05-05 00:53:32', 0);

-- --------------------------------------------------------

--
-- Table structure for table `rates`
--

CREATE TABLE `rates` (
  `t_userID` int(11) NOT NULL,
  `r_userID` int(11) NOT NULL,
  `score` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rates`
--

INSERT INTO `rates` (`t_userID`, `r_userID`, `score`) VALUES
(6, 7, 5),
(6, 10, 1),
(10, 7, 5);

-- --------------------------------------------------------

--
-- Table structure for table `reminder`
--

CREATE TABLE `reminder` (
  `reminder_id` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report`
--

CREATE TABLE `report` (
  `reportID` int(11) NOT NULL,
  `reporter` int(11) NOT NULL,
  `reported` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `reportID` int(11) NOT NULL,
  `adminID` int(11) NOT NULL,
  `reportedUserID` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `postID` int(11) DEFAULT NULL,
  `status` enum('pending','accepted','declined') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`reportID`, `adminID`, `reportedUserID`, `reason`, `created_at`, `postID`, `status`) VALUES
(1, 9, 6, 'do not like him', '2026-05-04 01:22:03', 9, 'accepted'),
(2, 6, 4, 'yapping', '2026-05-04 01:24:05', 8, 'accepted'),
(3, 6, 7, 'yapping', '2026-05-04 02:11:53', 10, 'declined'),
(4, 9, 6, 'yapping', '2026-05-04 04:23:23', 11, 'accepted');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `streak` int(11) DEFAULT 0,
  `rating` float DEFAULT NULL,
  `user_type` varchar(50) NOT NULL,
  `status` varchar(20) DEFAULT 'active',
  `is_trainer` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `email`, `name`, `password`, `streak`, `rating`, `user_type`, `status`, `is_trainer`) VALUES
(1, '1234@gmail.com', 'yo', '$2b$10$SixPwM8WiN30aMgt9aMcJODS/mmq.Ljbp3HMSe1g2gczvTaiOGuAm', 0, NULL, 'trainer', 'active', 0),
(2, 'qwe@gmail.com', 'Kazi ', '$2b$10$Lp38NkFHJg0DOB402JeQ.uV7L.Pgf/ifJPEbePJQLWJT5UazmHK3S', 0, NULL, 'user', 'active', 0),
(3, 'hasmia@gmail.com', 'hasin', '$2b$10$J6CID2I6cQlxbF8vtdBOSedbH1XvGDTB92Bx04RiYZ7qC4vHk48za', 0, NULL, 'user', 'active', 0),
(4, 'sanim@gmail.com', 'sain', '$2b$10$xdS5RsD4n4cFb702pWYZg.6miOzCEA62z9SPGipQEPaRrS2Kkc1J2', 0, NULL, 'user', 'active', 0),
(5, 'muhtady@gmail.com', 'Muhtady', '$2b$10$oL4O1Z/BxxBRN0qh3c0szOJm1wAjvq2Q3SdCy72tmYPBXUOhMjTVS', 0, NULL, 'user', 'active', 0),
(6, 'zayn@gmail.com', 'Zayn', '$2b$10$9udW8CSNtobHBgyoCOpNkeZDyWf9Z2ovWtR5KbY1a.oR0QIKc6B6G', 5, NULL, 'trainer', 'active', 0),
(7, 'nafi@gmail.com', 'Nafi', '$2b$10$EfXsHFIIrzTqIHla5mtjHuRxWslRzkn7gAPY8SxrreZ.7Nq2lozDm', 0, NULL, 'user', 'active', 0),
(8, 'admin@fitnessapp.com', 'Admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NULL, 'admin', 'active', 0),
(9, 'zawad@gmail.com', 'zawad ibn shams', '$2b$10$yTUxtTZYgPnWqSTL/NRBoO0sUBtR/AZqiIEuslK/JK4ccEXhUpobO', 25, NULL, 'trainer', 'active', 0),
(10, 'faaris@gmail.com', 'Faaris', '$2b$10$Escm4t4ktElR48gctjAIAOZgRM9Az3YVwfSRqxoSh9srGpHOcJ5jy', 1, NULL, 'trainer', 'active', 1);

-- --------------------------------------------------------

--
-- Table structure for table `workout`
--

CREATE TABLE `workout` (
  `w_id` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `cal_burned_per_hour` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workout`
--

INSERT INTO `workout` (`w_id`, `type`, `cal_burned_per_hour`) VALUES
(1, 'Running', 600),
(2, 'Cycling', 500),
(3, 'Swimming', 700),
(4, 'Walking', 250),
(5, 'Gym', 400),
(6, 'Football', 600),
(7, 'Yoga', 300),
(8, 'Basketball', 600),
(9, 'Tennis', 500),
(10, 'Martial Arts', 800),
(11, 'Boxing', 750),
(12, 'Golf', 350);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `userID` (`userID`),
  ADD KEY `w_id` (`w_id`);

--
-- Indexes for table `badges`
--
ALTER TABLE `badges`
  ADD PRIMARY KEY (`name`);

--
-- Indexes for table `challenge`
--
ALTER TABLE `challenge`
  ADD PRIMARY KEY (`userID`,`c_id`),
  ADD KEY `c_id` (`c_id`);

--
-- Indexes for table `challenge_info`
--
ALTER TABLE `challenge_info`
  ADD PRIMARY KEY (`c_id`);

--
-- Indexes for table `earns`
--
ALTER TABLE `earns`
  ADD PRIMARY KEY (`userID`,`name`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`f1UserID`,`f2UserID`),
  ADD KEY `f2UserID` (`f2UserID`);

--
-- Indexes for table `goals`
--
ALTER TABLE `goals`
  ADD PRIMARY KEY (`goal_id`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`sender`,`receiver`,`time`),
  ADD KEY `receiver` (`receiver`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notificationID`);

--
-- Indexes for table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`p_id`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `rates`
--
ALTER TABLE `rates`
  ADD PRIMARY KEY (`t_userID`,`r_userID`),
  ADD KEY `r_userID` (`r_userID`);

--
-- Indexes for table `reminder`
--
ALTER TABLE `reminder`
  ADD PRIMARY KEY (`reminder_id`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `report`
--
ALTER TABLE `report`
  ADD PRIMARY KEY (`reportID`),
  ADD KEY `reporter` (`reporter`),
  ADD KEY `reported` (`reported`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`reportID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `workout`
--
ALTER TABLE `workout`
  ADD PRIMARY KEY (`w_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `challenge_info`
--
ALTER TABLE `challenge_info`
  MODIFY `c_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `goals`
--
ALTER TABLE `goals`
  MODIFY `goal_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notificationID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `post`
--
ALTER TABLE `post`
  MODIFY `p_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `reminder`
--
ALTER TABLE `reminder`
  MODIFY `reminder_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report`
--
ALTER TABLE `report`
  MODIFY `reportID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `reportID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `workout`
--
ALTER TABLE `workout`
  MODIFY `w_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `activity_log_ibfk_2` FOREIGN KEY (`w_id`) REFERENCES `workout` (`w_id`) ON DELETE CASCADE;

--
-- Constraints for table `challenge`
--
ALTER TABLE `challenge`
  ADD CONSTRAINT `challenge_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `challenge_ibfk_2` FOREIGN KEY (`c_id`) REFERENCES `challenge_info` (`c_id`) ON DELETE CASCADE;

--
-- Constraints for table `earns`
--
ALTER TABLE `earns`
  ADD CONSTRAINT `earns_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `earns_ibfk_2` FOREIGN KEY (`name`) REFERENCES `badges` (`name`) ON DELETE CASCADE;

--
-- Constraints for table `friends`
--
ALTER TABLE `friends`
  ADD CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`f1UserID`) REFERENCES `users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`f2UserID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `goals`
--
ALTER TABLE `goals`
  ADD CONSTRAINT `goals_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
