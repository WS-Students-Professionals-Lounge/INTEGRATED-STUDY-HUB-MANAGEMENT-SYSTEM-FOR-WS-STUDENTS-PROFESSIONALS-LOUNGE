-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 22, 2026 at 02:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ws_lounge_lapaz_pro`
--

-- --------------------------------------------------------

--
-- Table structure for table `addons`
--

CREATE TABLE `addons` (
  `id` int(11) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `unit_price` float NOT NULL,
  `requires_quantity` tinyint(1) DEFAULT NULL,
  `min_quantity` int(11) DEFAULT NULL,
  `max_quantity` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance_logs`
--

CREATE TABLE `attendance_logs` (
  `id` int(11) NOT NULL,
  `membership_id` int(11) NOT NULL,
  `check_in_time` datetime NOT NULL,
  `check_out_time` datetime DEFAULT NULL,
  `hours_deducted` float DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daily_reports`
--

CREATE TABLE `daily_reports` (
  `id` int(11) NOT NULL,
  `report_date` date DEFAULT NULL,
  `total_check_ins` int(11) DEFAULT NULL,
  `total_logins` int(11) DEFAULT NULL,
  `total_timelogged` float DEFAULT NULL,
  `generated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `daily_reports`
--

INSERT INTO `daily_reports` (`id`, `report_date`, `total_check_ins`, `total_logins`, `total_timelogged`, `generated_at`) VALUES
(1, '2026-06-11', 6, 0, 720, '2026-06-10 20:07:54'),
(2, '2026-07-02', 6, 0, 600, '2026-07-01 16:43:01'),
(3, '2026-07-19', 1, 0, 14500, '2026-07-19 10:21:45'),
(4, '2026-07-20', 1, 0, 100, '2026-07-20 13:34:21');

-- --------------------------------------------------------

--
-- Table structure for table `equipment`
--

CREATE TABLE `equipment` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT 0.00,
  `quantity_available` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `equipment`
--

INSERT INTO `equipment` (`id`, `name`, `type`, `hourly_rate`, `quantity_available`) VALUES
(1, 'Projector', 'projector', 100.00, 2),
(2, 'Extra Chair', 'extra chair', 0.00, 2),
(3, 'Extension Cord', 'extension cord', 0.00, 1),
(4, 'Microphone', 'mic', 0.00, 2),
(5, 'Speaker', 'speaker', 0.00, 2),


-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `price` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `memberships`
--

CREATE TABLE `memberships` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` varchar(20) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `expiry_date` datetime NOT NULL,
  `total_hours` float DEFAULT NULL,
  `hours_left` float DEFAULT NULL,
  `plan_name` varchar(100) DEFAULT NULL,
  `is_checked_in` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_info`
--

CREATE TABLE `payment_info` (
  `id` int(11) NOT NULL,
  `method` varchar(32) NOT NULL,
  `account_name` varchar(128) DEFAULT NULL,
  `account_number` varchar(64) DEFAULT NULL,
  `qr_image` varchar(255) DEFAULT NULL,
  `instructions` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_info`
--

INSERT INTO `payment_info` (`id`, `method`, `account_name`, `account_number`, `qr_image`, `instructions`, `created_at`, `updated_at`) VALUES
(1, 'GCash', 'WS Students & Professionals Lounge', '0999XXXXXXX', 'gcashqr.png', 'Please make your payment using the details above and upload your payment receipt', '2026-06-07 14:52:33', '2026-07-21 14:02:33');
(2, 'Maya', 'WS Students & Professionals Lounge', '0999XXXXXXX', 'paymayaqr.png', 'Please make your payment using the details above and upload your payment receipt', '2026-06-07 14:52:33', '2026-07-21 14:02:33');

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `room_id` int(11) NOT NULL,
  `customer_name` varchar(64) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `address` varchar(128) DEFAULT NULL,
  `pax_count` int(11) DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `is_open_time` tinyint(1) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `total_amount` float DEFAULT NULL,
  `amount_paid` float DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_type` varchar(20) DEFAULT NULL,
  `receipt_image` varchar(255) DEFAULT NULL,
  `approved_by_id` int(11) DEFAULT NULL,
  `paid` tinyint(1) DEFAULT NULL,
  `added_by` varchar(64) DEFAULT NULL,
  `extra_notes` varchar(255) DEFAULT NULL,
  `extra_fee` float DEFAULT NULL,
  `discount_rate` float DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `addon_name` varchar(64) DEFAULT NULL,
  `addon_quantity` int(11) DEFAULT 0,
  `addon_total` float DEFAULT 0,
  `addon_subtotal` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `customer_id`, `user_id`, `room_id`, `customer_name`, `contact_number`, `address`, `pax_count`, `start_time`, `end_time`, `is_open_time`, `status`, `total_amount`, `amount_paid`, `payment_method`, `payment_type`, `receipt_image`, `approved_by_id`, `paid`, `added_by`, `extra_notes`, `extra_fee`, `discount_rate`, `created_at`, `addon_name`, `addon_quantity`, `addon_total`, `addon_subtotal`) VALUES
(9, 100, 3, 2, 'rikrike', '12344411', NULL, 1, '2026-06-11 01:40:09', '2026-06-11 01:40:21', 1, 'Checked-Out', 50, 0, NULL, 'Downpayment', NULL, NULL, 1, 'wslounge', NULL, 0, 0, '2026-06-10 17:40:10', NULL, 0, 0, 0),
(10, 1, 3, 8, 'rikrikec', '1234441111', NULL, 1, '2026-06-11 01:41:17', '2026-06-11 01:42:30', 1, 'Checked-Out', 35, 0, NULL, 'Downpayment', NULL, 3, 1, 'wslounge', NULL, 0, 0, '2026-06-10 17:41:17', NULL, 0, 0, 0),
(11, 2, 3, 8, 'cedced', '12344411', NULL, 1, '2026-06-11 01:42:11', '2026-06-11 01:42:38', 1, 'Checked-Out', 35, 0, NULL, 'Downpayment', NULL, NULL, 1, 'wslounge', '', 0, 0, '2026-06-10 17:42:12', NULL, 0, 0, 0),
(12, 101, 3, 4, 'cedced', '12344411', NULL, 1, '2026-06-11 01:43:35', '2026-06-11 01:43:43', 1, 'Checked-Out', 250, 0, NULL, 'Downpayment', NULL, NULL, 1, 'wslounge', '', 0, 0, '2026-06-10 17:43:36', NULL, 0, 0, 0),
(13, 102, 3, 2, 'cedced', '12344411', NULL, 1, '2026-06-11 03:30:00', '2026-06-11 03:32:07', 0, 'Checked-Out', 100, 0, NULL, 'Downpayment', NULL, NULL, 1, 'wslounge', '', 0, 0, '2026-06-10 19:32:01', NULL, 0, 0, 0),
(14, 103, 3, 4, 'cedced', '12344411', NULL, 1, '2026-06-11 04:07:00', '2026-06-11 04:07:54', 0, 'Checked-Out', 250, 0, NULL, 'Downpayment', NULL, NULL, 1, 'wslounge', '', 0, 0, '2026-06-10 20:07:50', NULL, 0, 0, 0),
(15, 104, 36, 4, 'Test Member', '09171234567', NULL, 2, '2026-05-17 10:00:00', '2026-07-02 00:42:44', 0, 'Checked-Out', 100, 50, 'GCash', 'Downpayment', 'receipt_36_1782922558_receipt.png', NULL, 1, 'member', 'Feature test booking', 0, 0, '2026-07-01 16:15:58', NULL, 0, 0, 0),
(18, 107, 51, 4, 'Test Member', '09171234567', NULL, 2, '2026-05-17 10:00:00', '2026-07-02 00:42:48', 0, 'Checked-Out', 100, 50, 'GCash', 'Downpayment', 'receipt_51_1782922908_receipt.png', NULL, 1, 'member', 'Feature test booking', 0, 0, '2026-07-01 16:21:48', NULL, 0, 0, 0),
(20, 109, 57, 4, 'Test Member', '09171234567', NULL, 2, '2026-05-17 10:00:00', '2026-07-02 00:42:51', 0, 'Checked-Out', 100, 50, 'GCash', 'Downpayment', 'receipt_57_1782922970_receipt.png', NULL, 1, 'member', 'Feature test booking', 0, 0, '2026-07-01 16:22:50', NULL, 0, 0, 0),
(22, 111, 63, 4, 'Test Member', '09171234567', NULL, 2, '2026-05-17 10:00:00', '2026-07-02 00:42:54', 0, 'Checked-Out', 100, 50, 'GCash', 'Downpayment', 'receipt_63_1782923069_receipt.png', NULL, 1, 'member', 'Feature test booking', 0, 0, '2026-07-01 16:24:29', NULL, 0, 0, 0),
(24, 113, 69, 4, 'Test Member', '09171234567', NULL, 2, '2026-05-17 10:00:00', '2026-07-02 00:42:56', 0, 'Checked-Out', 100, 50, 'GCash', 'Downpayment', 'receipt_69_1782923210_receipt.png', NULL, 1, 'member', 'Feature test booking', 0, 0, '2026-07-01 16:26:50', NULL, 0, 0, 0),
(26, 115, 75, 4, 'Test Member', '09171234567', NULL, 2, '2026-05-17 10:00:00', '2026-07-02 00:43:01', 0, 'Checked-Out', 100, 50, 'GCash', 'Downpayment', 'receipt_75_1782923325_receipt.png', NULL, 1, 'member', 'Feature test booking', 0, 0, '2026-07-01 16:28:45', NULL, 0, 0, 0),
(27, 116, 2, 2, 'Verify Reservation', '09170000000', NULL, 1, '2026-07-07 17:04:37', '2026-07-19 18:21:45', 1, 'Checked-Out', 14500, 0, NULL, 'Downpayment', NULL, NULL, 1, 'admin', 'verification', 0, 0, '2026-07-07 09:04:37', NULL, 0, 0, 300),
(30, NULL, 3, 2, 'Newer', '222', NULL, 1, '2026-07-22 21:30:30', '2026-07-20 21:34:21', 0, 'Checked-Out', 100, 0, NULL, 'Downpayment', NULL, NULL, 1, NULL, NULL, 0, 0, '2026-07-20 13:30:30', NULL, 0, 0, 0),
(31, 105, 90, 35, 'Test Member', '09171234567', NULL, 2, '2026-05-17 10:00:00', '2026-05-17 12:00:00', 0, 'Pending', 100, 50, 'GCash', 'Downpayment', 'receipt_90_1784642553_receipt.png', NULL, 0, 'member', 'Feature test booking', 0, 0, '2026-07-21 14:02:33', NULL, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `reservation_addons`
--

CREATE TABLE `reservation_addons` (
  `id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `addon_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` float NOT NULL,
  `subtotal` float DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(64) NOT NULL,
  `base_rate` float NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `name`, `base_rate`, `category`, `status`) VALUES
(2, 'Small Meeting Room', 50, 'meeting', 'available'),
(3, 'Lecture Room', 150, 'lecture', 'available'),
(4, 'Conference Room', 250, 'conference', 'available'),
(5, 'Comfy Room', 150, 'comfy', 'available'),
(6, 'Event Room 1', 300, 'event', 'available'),
(7, 'Event Room 2', 300, 'event', 'available'),
(8, 'Common Area', 35, 'solo', 'available'),
(35, 'Test Room', 50, 'standard', 'unavailable');

-- --------------------------------------------------------

--
-- Table structure for table `solo_plans`
--

CREATE TABLE `solo_plans` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `approved_by_id` int(11) DEFAULT NULL,
  `plan_name` varchar(64) NOT NULL,
  `status` varchar(20) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `receipt_image` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `expiry_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `time_logs`
--

CREATE TABLE `time_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan` varchar(64) DEFAULT NULL,
  `time_in` datetime DEFAULT NULL,
  `time_out` datetime DEFAULT NULL,
  `total_time` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `membership_id` varchar(20) DEFAULT NULL,
  `name` varchar(64) NOT NULL,
  `email` varchar(120) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `expiry_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `failed_login_attempts` int(11) DEFAULT 0,
  `last_failed_login` datetime DEFAULT NULL,
  `locked_until` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `customer_id`, `membership_id`, `name`, `email`, `phone`, `password`, `role`, `is_active`, `expiry_date`, `created_at`, `failed_login_attempts`, `last_failed_login`, `locked_until`) VALUES
(2, NULL, NULL, 'admin', 'admin-f236f8b7@example.com', NULL, 'scrypt:32768:8:1$pI60ZpFeOYoqfnyn$69e19bd539b3cdcd5a12813ea7fd5c8c54136025e496a76971fda4375b6da094661b910f665a5680d8051087bc3d07259243ed1ef40935a8a3e8b57f1eebb19a', 'admin', 1, NULL, '2026-06-07 14:52:33', 0, NULL, NULL),
(3, NULL, NULL, 'wslounge', 'wslounge@lounge.com', '09171111111', 'scrypt:32768:8:1$S8oZSVmuHbX7Vyqp$95cda42d51e6f347165db2a074d4ae78d919bf709609c47438662a3eb5dc0500ad9fc4b8ae134ab044219aae006819ee22afb9af4f780d46ef2a0f47294e213a', 'admin', 1, NULL, '2026-06-07 14:52:34', 0, NULL, NULL),
(77, NULL, NULL, 'king', 'kingking@gmail.com', '09763678212', 'scrypt:32768:8:1$PLLmbP3Sf9QCXF7c$408380abb718cd75e1602356886820b2772c534809d8f1dfa252f5c0b5a5a291fe3803ddf101a7b2d9db21bb211f04aaad79f743584f56a306dab069f2b2ab08', 'member', 1, NULL, '2026-07-19 11:15:23', 0, NULL, NULL),
(78, NULL, NULL, 'test', 'test-da5ba7d6@example.com', NULL, 'scrypt:32768:8:1$S6vxI1F8RaBAl0DU$05667f2e71590bd7bec6e754e22fad1f392c7b140565f5402079266df2a266b5558dd6899c710178b1ca70d8a77697e0129ac3b7cdaf3f0a0e7db751297d9707', 'member', 1, NULL, '2026-07-20 13:06:15', 0, NULL, NULL),
(79, NULL, NULL, 'legacy', 'legacy-7a288b3c@example.com', NULL, 'legacy-pass', 'member', 1, NULL, '2026-07-20 13:06:16', 0, NULL, NULL),
(80, NULL, NULL, 'brad', 'brad@gmail.com', '09739947722', 'scrypt:32768:8:1$hDXdjCOHxx2ESoLi$e5233b007ff7cccc3b43c304559606db31ea99cfdd53b34148e7d4b0e46835db7d0d4a35fb1d4f508e09e69e83c3f075c1b829f14781d282973cfac8ccc5ccab', 'member', 1, NULL, '2026-07-20 13:15:08', 0, NULL, NULL),
(81, NULL, NULL, 'legacy', 'legacy-c6740e33@example.com', NULL, 'legacy-pass', 'member', 1, NULL, '2026-07-20 13:47:25', 0, NULL, NULL),
(83, NULL, NULL, 'legacy', 'legacy-f820bcbc@example.com', NULL, 'legacy-pass', 'member', 1, NULL, '2026-07-20 13:50:05', 0, NULL, NULL),
(84, NULL, NULL, 'admin', 'admin-765e52b3@example.com', NULL, 'scrypt:32768:8:1$r1HlTKeTq1cx5PqO$f070bdc2968ffc03f297233157eebe3192e7b0785a721398433eb3d23f1e1aade3e670c1484f016092b19acc01f6dedfb52caed8b27be9cb24862d39ad2670b4', 'admin', 1, NULL, '2026-07-20 13:50:06', 0, NULL, NULL),
(85, NULL, NULL, 'test', 'test-33bab321@example.com', NULL, 'scrypt:32768:8:1$ENVWdqnpzOQaVx61$97cee1cf2c2821742baa2b4f6a841dfd6fd9bebeaefb5d00cfa8a86cd83d16613ac79a6a4029799f8932db4e5b9b1116beab2260f55928062bb170d7ae160037', 'member', 1, NULL, '2026-07-21 13:52:29', 0, NULL, NULL),
(86, NULL, NULL, 'legacy', 'legacy-e90fc72b@example.com', NULL, 'legacy-pass', 'member', 1, NULL, '2026-07-21 13:52:29', 0, NULL, NULL),
(87, NULL, NULL, 'test', 'test-293c6dfe@example.com', NULL, 'scrypt:32768:8:1$WZRZhO9dfhedv0PW$b31a4ab58dbc8252a13df40e5a268aacb30b01f0e5a10dd37a8df935e6f05a1de848ad440799ebd6e90b1a6dd33c3fb8b6826f317cc08d3c78983ab01218771a', 'member', 1, NULL, '2026-07-21 14:02:31', 0, NULL, NULL),
(88, NULL, NULL, 'legacy', 'legacy-b9223e2d@example.com', NULL, 'legacy-pass', 'member', 1, NULL, '2026-07-21 14:02:31', 0, NULL, NULL),
(89, NULL, NULL, 'sqlite fallback', 'sqlite-fallback-902b3098@example.com', '09170000000', 'legacy-pass', 'member', 1, NULL, '2026-07-21 14:02:32', 0, NULL, NULL),
(90, NULL, NULL, 'member', 'member-33b17f92@example.com', NULL, 'scrypt:32768:8:1$y7k2NEfy9KRqg5UO$da70578c17d70ec98c40661a68f34cab1ff3392a11c0028b5b578b8c6e7b498c60e8b8e4c90e3d22cda5ecc9c4027d2c0bd4afe195e878a6d6acad79ac5d3b5a', 'member', 1, NULL, '2026-07-21 14:02:32', 0, NULL, NULL),
(91, NULL, NULL, 'admin', 'admin-2b61f40c@example.com', NULL, 'scrypt:32768:8:1$wvUnseIVl25r21EH$c6bef036bdf8167d64e03e601b958168566cb7e13ea7e365c989bd87f353cd74a1025dfd5661fec850fef056456601b890ca132ef2a935cc424d0875baf342ab', 'admin', 1, NULL, '2026-07-21 14:02:32', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_activity_logs`
--

CREATE TABLE `user_activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `activity_type` varchar(50) DEFAULT NULL,
  `activity_time` datetime DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `walkin_addons`
--

CREATE TABLE `walkin_addons` (
  `id` int(11) NOT NULL,
  `walkin_reservation_id` int(11) NOT NULL,
  `addon_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` float NOT NULL,
  `subtotal` float DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `walkin_reservations`
--

CREATE TABLE `walkin_reservations` (
  `id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `customer_name` varchar(64) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `pax_count` int(11) DEFAULT NULL,t
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `total_amount` float DEFAULT NULL,
  `paid` tinyint(1) DEFAULT NULL,
  `extra_fee` float DEFAULT NULL,
  `added_by` varchar(64) DEFAULT NULL,
  `extra_notes` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `addon_name` varchar(64) DEFAULT NULL,
  `addon_quantity` int(11) DEFAULT 0,
  `addon_total` float DEFAULT 0,
  `addon_subtotal` float NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `walkin_reservations`
--

INSERT INTO `walkin_reservations` (`id`, `reservation_id`, `user_id`, `room_id`, `customer_name`, `contact_number`, `pax_count`, `start_time`, `end_time`, `status`, `total_amount`, `paid`, `extra_fee`, `added_by`, `extra_notes`, `created_at`, `addon_name`, `addon_quantity`, `addon_total`, `addon_subtotal`) VALUES
(2, 11, 3, 8, 'cedced', '12344411', 1, '2026-06-11 01:42:11', '2026-06-11 01:42:38', 'Checked-Out', 35, 1, 0, 'wslounge', NULL, '2026-06-10 17:42:12', NULL, 0, 0, 0),
(3, 12, 3, 4, 'cedced', '12344411', 1, '2026-06-11 01:43:35', '2026-06-11 01:43:43', 'Checked-Out', 250, 1, 0, 'wslounge', NULL, '2026-06-10 17:43:36', NULL, 0, 0, 0),
(4, 13, 3, 2, 'cedced', '12344411', 1, '2026-06-11 03:30:00', '2026-06-11 03:32:07', 'Checked-Out', 100, 1, 0, 'wslounge', NULL, '2026-06-10 19:32:01', NULL, 0, 0, 0),
(5, 14, 3, 4, 'cedced', '12344411', 1, '2026-06-11 04:07:00', '2026-06-11 04:07:54', 'Checked-Out', 250, 1, 0, 'wslounge', NULL, '2026-06-10 20:07:50', NULL, 0, 0, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addons`
--
ALTER TABLE `addons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `membership_id` (`membership_id`);

--
-- Indexes for table `daily_reports`
--
ALTER TABLE `daily_reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `report_date` (`report_date`);

--
-- Indexes for table `equipment`
--
ALTER TABLE `equipment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `memberships`
--
ALTER TABLE `memberships`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `payment_info`
--
ALTER TABLE `payment_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `method` (`method`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_id` (`customer_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `approved_by_id` (`approved_by_id`);

--
-- Indexes for table `reservation_addons`
--
ALTER TABLE `reservation_addons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservation_id` (`reservation_id`),
  ADD KEY `addon_id` (`addon_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `solo_plans`
--
ALTER TABLE `solo_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_id` (`customer_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `approved_by_id` (`approved_by_id`);

--
-- Indexes for table `time_logs`
--
ALTER TABLE `time_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `customer_id` (`customer_id`),
  ADD UNIQUE KEY `membership_id` (`membership_id`);

--
-- Indexes for table `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `walkin_addons`
--
ALTER TABLE `walkin_addons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `walkin_reservation_id` (`walkin_reservation_id`),
  ADD KEY `addon_id` (`addon_id`);

--
-- Indexes for table `walkin_reservations`
--
ALTER TABLE `walkin_reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservation_id` (`reservation_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addons`
--
ALTER TABLE `addons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `daily_reports`
--
ALTER TABLE `daily_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `equipment`
--
ALTER TABLE `equipment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `memberships`
--
ALTER TABLE `memberships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_info`
--
ALTER TABLE `payment_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `reservation_addons`
--
ALTER TABLE `reservation_addons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `solo_plans`
--
ALTER TABLE `solo_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `time_logs`
--
ALTER TABLE `time_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `walkin_addons`
--
ALTER TABLE `walkin_addons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `walkin_reservations`
--
ALTER TABLE `walkin_reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD CONSTRAINT `attendance_logs_ibfk_1` FOREIGN KEY (`membership_id`) REFERENCES `memberships` (`id`);

--
-- Constraints for table `memberships`
--
ALTER TABLE `memberships`
  ADD CONSTRAINT `memberships_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  ADD CONSTRAINT `reservations_ibfk_3` FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `reservation_addons`
--
ALTER TABLE `reservation_addons`
  ADD CONSTRAINT `reservation_addons_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservation_addons_ibfk_2` FOREIGN KEY (`addon_id`) REFERENCES `addons` (`id`);

--
-- Constraints for table `solo_plans`
--
ALTER TABLE `solo_plans`
  ADD CONSTRAINT `solo_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `solo_plans_ibfk_2` FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `time_logs`
--
ALTER TABLE `time_logs`
  ADD CONSTRAINT `time_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  ADD CONSTRAINT `user_activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `walkin_addons`
--
ALTER TABLE `walkin_addons`
  ADD CONSTRAINT `walkin_addons_ibfk_1` FOREIGN KEY (`walkin_reservation_id`) REFERENCES `walkin_reservations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `walkin_addons_ibfk_2` FOREIGN KEY (`addon_id`) REFERENCES `addons` (`id`);

--
-- Constraints for table `walkin_reservations`
--
ALTER TABLE `walkin_reservations`
  ADD CONSTRAINT `walkin_reservations_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `walkin_reservations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `walkin_reservations_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
