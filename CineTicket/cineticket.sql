-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 16, 2025 at 08:31 AM
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
-- Database: `cineticket`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `Id` int(11) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `TotalAmount` decimal(8,2) NOT NULL,
  `BookingStatus` varchar(50) NOT NULL,
  `PaymentStatus` varchar(50) NOT NULL,
  `PaymentReference` varchar(100) DEFAULT NULL,
  `UserId` int(11) NOT NULL,
  `ScreeningId` int(11) NOT NULL,
  `CreatedById` int(11) DEFAULT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedById` int(11) DEFAULT NULL,
  `PaidAt` datetime(6) DEFAULT NULL,
  `PaymentMethod` varchar(50) DEFAULT NULL,
  `TransactionId` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookingseats`
--

CREATE TABLE `bookingseats` (
  `Id` int(11) NOT NULL,
  `BookingId` int(11) NOT NULL,
  `SeatId` int(11) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT '0001-01-01 00:00:00.000000'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cinemahalls`
--

CREATE TABLE `cinemahalls` (
  `Id` int(11) NOT NULL,
  `Name` varchar(50) NOT NULL,
  `Capacity` int(11) NOT NULL,
  `HallType` varchar(100) NOT NULL,
  `CinemaId` int(11) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT '0001-01-01 00:00:00.000000',
  `CreatedById` int(11) DEFAULT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedById` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cinemahalls`
--

INSERT INTO `cinemahalls` (`Id`, `Name`, `Capacity`, `HallType`, `CinemaId`, `CreatedAt`, `CreatedById`, `UpdatedAt`, `UpdatedById`) VALUES
(2, 'Hall LM1', 120, 'IMAX', 3, '2025-04-06 04:36:04.592902', 8, '2025-04-06 05:14:06.695338', 8),
(3, 'Hall SVH1', 120, 'IMAX', 5, '2025-04-06 06:01:46.317797', 8, NULL, NULL),
(5, 'Hall GM1', 100, 'IMAX', 6, '2025-04-11 16:42:13.237999', 8, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cinemas`
--

CREATE TABLE `cinemas` (
  `Id` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Address` varchar(200) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  `Description` varchar(500) NOT NULL,
  `ImageUrl` varchar(255) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT '0001-01-01 00:00:00.000000',
  `CreatedById` int(11) DEFAULT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedById` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cinemas`
--

INSERT INTO `cinemas` (`Id`, `Name`, `Address`, `PhoneNumber`, `Description`, `ImageUrl`, `CreatedAt`, `CreatedById`, `UpdatedAt`, `UpdatedById`) VALUES
(3, 'CGV Landmark 81', '720A Điện Biên Phủ, P.22, Q.Bình Thạnh, TP. HCM', '1900 6017', 'Rạp chiếu phim cao nhất Việt Nam, nằm trong tòa nhà Landmark 81', 'http://localhost:5246/content/uploads/342348d3-3e58-420c-bc3a-5d2e5b0a4ba8.png', '2025-04-06 03:14:00.612833', 8, '2025-04-06 03:22:34.727523', 8),
(5, 'CGV Sư Vạn Hạnh', 'Tầng 6, Vạn Hạnh Mall, 11 Sư Vạn Hạnh, Phường 12, Quận 10', '1900 6017', 'Rạp chiếu phim nằm trong Vạn Hạnh Mall', 'http://localhost:5246/content/uploads/b3c010c5-8250-4146-9ea8-6c952ad6f8af.png', '2025-04-06 05:59:41.905916', 8, NULL, NULL),
(6, 'CGV Gigamall Thủ Đức', 'Tầng 6 TTTM GIGAMALL, 240-242 Phạm Văn Đồng, P. Hiệp Bình Chánh, Q. Thủ Đức, TPHCM.', '1900 6017', 'Rạp chiếu phim nằm trong GIGAMALL', 'http://localhost:5246/content/uploads/064bd9b6-2b05-4138-bf45-51b67032d987.jpg', '2025-04-11 16:41:08.471723', 8, NULL, NULL),
(7, 'CGV Vivo City', 'Lầu 5, Trung tâm thương mại SC VivoCity - 1058 Nguyễn Văn Linh, Quận 7', '1900 6017', 'Rạp chiếu phim nằm trong SC VivoCity', 'http://localhost:5246/content/uploads/7418d1cc-8bdd-44c0-a3bc-479d57a51801.png', '2025-04-11 17:29:54.493304', 8, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `movies`
--

CREATE TABLE `movies` (
  `Id` int(11) NOT NULL,
  `Title` varchar(100) NOT NULL,
  `Description` varchar(500) NOT NULL,
  `PosterUrl` varchar(255) NOT NULL,
  `BackdropUrl` varchar(255) NOT NULL,
  `Genre` varchar(50) NOT NULL,
  `ReleaseDate` datetime(6) NOT NULL,
  `DurationMinutes` int(11) NOT NULL,
  `Rating` decimal(3,1) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT '0001-01-01 00:00:00.000000',
  `CreatedById` int(11) DEFAULT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedById` int(11) DEFAULT NULL,
  `EndDate` datetime(6) DEFAULT NULL,
  `TrailerUrl` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movies`
--

INSERT INTO `movies` (`Id`, `Title`, `Description`, `PosterUrl`, `BackdropUrl`, `Genre`, `ReleaseDate`, `DurationMinutes`, `Rating`, `CreatedAt`, `CreatedById`, `UpdatedAt`, `UpdatedById`, `EndDate`, `TrailerUrl`) VALUES
(5, 'Nụ Hôn Bạc Tỷ', 'Câu chuyện xoay quanh Vân - cô gái bán bánh mì vô tình gặp phải hai chàng trai trong một tai nạn nhỏ. Làm thế nào khi tiếng sét ái tình đánh một lúc cả ba người? Liệu giữa một chàng trai chững chạc, nam tính và một chàng trai đôi chút ngông nghênh, cool ngầu - đâu sẽ là “Nụ Hôn Bạc Tỷ” của cô gái xinh đẹp?', 'http://localhost:5246/content/uploads/8d142124-a94d-4972-b486-492524ee42d3.jpg', 'http://localhost:5246/content/uploads/b9966776-174e-4922-9b32-2128ac928fe0.jpg', 'Hài hước', '2025-04-01 00:00:00.000000', 120, 8.0, '2025-04-11 03:42:50.110976', 8, '2025-04-11 04:46:04.671532', 8, '2025-04-30 00:00:00.000000', 'https://www.youtube.com/embed/wr6MeifZCUs'),
(6, 'Avengers: Endgame', 'Siêu anh hùng tập hợp để cứu thế giới', 'http://localhost:5246/content/uploads/54ab0781-fd53-4994-912c-75e3fb97d7a2.jpg', 'http://localhost:5246/content/uploads/4822fce5-dfbd-4e09-8245-8710279681d6.png', 'Hành động', '2025-05-01 00:00:00.000000', 180, 9.0, '2025-04-11 04:12:26.956643', 8, '2025-04-16 12:32:53.191331', 8, '2025-05-30 00:00:00.000000', 'https://www.youtube.com/embed/TcMBFSGVi1c'),
(7, 'Avengers: Doomsday', 'Siêu anh hùng tập hợp để cứu thế giới', 'http://localhost:5246/content/uploads/4cd4b915-e994-434e-97d9-e58b23774682.jpg', 'http://localhost:5246/content/uploads/7a16140d-d5a2-4444-84b4-43ddea51812a.jpg', 'Hành động', '2026-05-01 00:00:00.000000', 150, 8.5, '2025-04-11 04:12:26.956643', 8, '2025-04-16 12:34:12.157990', 8, '2026-06-30 00:00:00.000000', 'https://www.youtube.com/embed/aZXBFirj6b4');

-- --------------------------------------------------------

--
-- Table structure for table `screenings`
--

CREATE TABLE `screenings` (
  `Id` int(11) NOT NULL,
  `StartTime` datetime(6) NOT NULL,
  `EndTime` datetime(6) NOT NULL,
  `Price` decimal(10,0) NOT NULL,
  `MovieId` int(11) NOT NULL,
  `CinemaHallId` int(11) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT '0001-01-01 00:00:00.000000',
  `CreatedById` int(11) DEFAULT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedById` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `screenings`
--

INSERT INTO `screenings` (`Id`, `StartTime`, `EndTime`, `Price`, `MovieId`, `CinemaHallId`, `CreatedAt`, `CreatedById`, `UpdatedAt`, `UpdatedById`) VALUES
(491, '2025-04-27 11:00:00.000000', '2025-04-27 13:00:00.000000', 100000, 5, 2, '2025-04-16 13:21:52.342735', 8, NULL, NULL),
(492, '2025-04-27 14:00:00.000000', '2025-04-27 16:00:00.000000', 100000, 5, 2, '2025-04-16 13:22:01.342308', 8, NULL, NULL),
(493, '2025-04-27 17:00:00.000000', '2025-04-27 19:00:00.000000', 100000, 5, 2, '2025-04-16 13:22:08.424692', 8, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `seats`
--

CREATE TABLE `seats` (
  `Id` int(11) NOT NULL,
  `Row` longtext NOT NULL,
  `Number` int(11) NOT NULL,
  `SeatType` varchar(50) NOT NULL,
  `CinemaHallId` int(11) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT '0001-01-01 00:00:00.000000',
  `CreatedById` int(11) DEFAULT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedById` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `seats`
--

INSERT INTO `seats` (`Id`, `Row`, `Number`, `SeatType`, `CinemaHallId`, `CreatedAt`, `CreatedById`, `UpdatedAt`, `UpdatedById`) VALUES
(361, 'A', 1, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(362, 'A', 2, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(363, 'A', 3, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(364, 'A', 4, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(365, 'A', 5, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(366, 'A', 6, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(367, 'A', 7, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(368, 'A', 8, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(369, 'A', 9, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(370, 'A', 10, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(371, 'A', 11, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(372, 'A', 12, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(373, 'B', 1, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(374, 'B', 2, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(375, 'B', 3, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(376, 'B', 4, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(377, 'B', 5, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(378, 'B', 6, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(379, 'B', 7, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(380, 'B', 8, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(381, 'B', 9, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(382, 'B', 10, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(383, 'B', 11, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(384, 'B', 12, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(385, 'C', 1, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(386, 'C', 2, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(387, 'C', 3, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(388, 'C', 4, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(389, 'C', 5, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(390, 'C', 6, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(391, 'C', 7, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(392, 'C', 8, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(393, 'C', 9, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(394, 'C', 10, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(395, 'C', 11, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(396, 'C', 12, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(397, 'D', 1, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(398, 'D', 2, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(399, 'D', 3, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(400, 'D', 4, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(401, 'D', 5, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(402, 'D', 6, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(403, 'D', 7, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(404, 'D', 8, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(405, 'D', 9, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(406, 'D', 10, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(407, 'D', 11, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(408, 'D', 12, 'Standard', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(409, 'E', 1, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(410, 'E', 2, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(411, 'E', 3, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(412, 'E', 4, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(413, 'E', 5, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(414, 'E', 6, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(415, 'E', 7, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(416, 'E', 8, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(417, 'E', 9, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(418, 'E', 10, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(419, 'E', 11, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(420, 'E', 12, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(421, 'F', 1, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(422, 'F', 2, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(423, 'F', 3, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(424, 'F', 4, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(425, 'F', 5, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(426, 'F', 6, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(427, 'F', 7, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(428, 'F', 8, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(429, 'F', 9, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(430, 'F', 10, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(431, 'F', 11, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(432, 'F', 12, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(433, 'G', 1, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(434, 'G', 2, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(435, 'G', 3, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(436, 'G', 4, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(437, 'G', 5, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(438, 'G', 6, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(439, 'G', 7, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(440, 'G', 8, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(441, 'G', 9, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(442, 'G', 10, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(443, 'G', 11, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(444, 'G', 12, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(445, 'H', 1, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(446, 'H', 2, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(447, 'H', 3, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(448, 'H', 4, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(449, 'H', 5, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(450, 'H', 6, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(451, 'H', 7, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(452, 'H', 8, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(453, 'H', 9, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(454, 'H', 10, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(455, 'H', 11, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(456, 'H', 12, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(457, 'I', 1, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(458, 'I', 2, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(459, 'I', 3, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(460, 'I', 4, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(461, 'I', 5, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(462, 'I', 6, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(463, 'I', 7, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(464, 'I', 8, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(465, 'I', 9, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(466, 'I', 10, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(467, 'I', 11, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(468, 'I', 12, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(469, 'J', 1, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(470, 'J', 2, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(471, 'J', 3, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(472, 'J', 4, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(473, 'J', 5, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(474, 'J', 6, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(475, 'J', 7, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(476, 'J', 8, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(477, 'J', 9, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(478, 'J', 10, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(479, 'J', 11, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(480, 'J', 12, 'VIP', 2, '2025-04-06 05:14:06.695338', 8, NULL, NULL),
(481, 'A', 1, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(482, 'A', 2, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(483, 'A', 3, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(484, 'A', 4, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(485, 'A', 5, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(486, 'A', 6, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(487, 'A', 7, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(488, 'A', 8, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(489, 'A', 9, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(490, 'A', 10, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(491, 'A', 11, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(492, 'B', 1, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(493, 'B', 2, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(494, 'B', 3, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(495, 'B', 4, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(496, 'B', 5, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(497, 'B', 6, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(498, 'B', 7, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(499, 'B', 8, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(500, 'B', 9, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(501, 'B', 10, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(502, 'B', 11, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(503, 'C', 1, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(504, 'C', 2, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(505, 'C', 3, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(506, 'C', 4, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(507, 'C', 5, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(508, 'C', 6, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(509, 'C', 7, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(510, 'C', 8, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(511, 'C', 9, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(512, 'C', 10, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(513, 'C', 11, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(514, 'D', 1, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(515, 'D', 2, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(516, 'D', 3, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(517, 'D', 4, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(518, 'D', 5, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(519, 'D', 6, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(520, 'D', 7, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(521, 'D', 8, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(522, 'D', 9, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(523, 'D', 10, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(524, 'D', 11, 'Standard', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(525, 'E', 1, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(526, 'E', 2, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(527, 'E', 3, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(528, 'E', 4, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(529, 'E', 5, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(530, 'E', 6, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(531, 'E', 7, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(532, 'E', 8, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(533, 'E', 9, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(534, 'E', 10, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(535, 'E', 11, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(536, 'F', 1, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(537, 'F', 2, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(538, 'F', 3, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(539, 'F', 4, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(540, 'F', 5, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(541, 'F', 6, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(542, 'F', 7, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(543, 'F', 8, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(544, 'F', 9, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(545, 'F', 10, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(546, 'F', 11, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(547, 'G', 1, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(548, 'G', 2, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(549, 'G', 3, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(550, 'G', 4, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(551, 'G', 5, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(552, 'G', 6, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(553, 'G', 7, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(554, 'G', 8, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(555, 'G', 9, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(556, 'G', 10, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(557, 'G', 11, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(558, 'H', 1, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(559, 'H', 2, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(560, 'H', 3, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(561, 'H', 4, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(562, 'H', 5, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(563, 'H', 6, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(564, 'H', 7, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(565, 'H', 8, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(566, 'H', 9, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(567, 'H', 10, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(568, 'H', 11, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(569, 'I', 1, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(570, 'I', 2, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(571, 'I', 3, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(572, 'I', 4, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(573, 'I', 5, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(574, 'I', 6, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(575, 'I', 7, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(576, 'I', 8, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(577, 'I', 9, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(578, 'I', 10, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(579, 'I', 11, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(580, 'J', 1, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(581, 'J', 2, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(582, 'J', 3, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(583, 'J', 4, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(584, 'J', 5, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(585, 'J', 6, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(586, 'J', 7, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(587, 'J', 8, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(588, 'J', 9, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(589, 'J', 10, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(590, 'J', 11, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(591, 'K', 1, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(592, 'K', 2, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(593, 'K', 3, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(594, 'K', 4, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(595, 'K', 5, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(596, 'K', 6, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(597, 'K', 7, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(598, 'K', 8, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(599, 'K', 9, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(600, 'K', 10, 'VIP', 3, '2025-04-06 06:01:46.335916', 8, NULL, NULL),
(821, 'A', 1, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(822, 'A', 2, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(823, 'A', 3, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(824, 'A', 4, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(825, 'A', 5, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(826, 'A', 6, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(827, 'A', 7, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(828, 'A', 8, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(829, 'A', 9, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(830, 'A', 10, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(831, 'B', 1, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(832, 'B', 2, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(833, 'B', 3, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(834, 'B', 4, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(835, 'B', 5, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(836, 'B', 6, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(837, 'B', 7, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(838, 'B', 8, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(839, 'B', 9, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(840, 'B', 10, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(841, 'C', 1, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(842, 'C', 2, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(843, 'C', 3, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(844, 'C', 4, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(845, 'C', 5, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(846, 'C', 6, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(847, 'C', 7, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(848, 'C', 8, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(849, 'C', 9, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(850, 'C', 10, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(851, 'D', 1, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(852, 'D', 2, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(853, 'D', 3, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(854, 'D', 4, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(855, 'D', 5, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(856, 'D', 6, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(857, 'D', 7, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(858, 'D', 8, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(859, 'D', 9, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(860, 'D', 10, 'Standard', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(861, 'E', 1, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(862, 'E', 2, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(863, 'E', 3, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(864, 'E', 4, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(865, 'E', 5, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(866, 'E', 6, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(867, 'E', 7, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(868, 'E', 8, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(869, 'E', 9, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(870, 'E', 10, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(871, 'F', 1, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(872, 'F', 2, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(873, 'F', 3, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(874, 'F', 4, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(875, 'F', 5, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(876, 'F', 6, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(877, 'F', 7, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(878, 'F', 8, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(879, 'F', 9, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(880, 'F', 10, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(881, 'G', 1, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(882, 'G', 2, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(883, 'G', 3, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(884, 'G', 4, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(885, 'G', 5, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(886, 'G', 6, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(887, 'G', 7, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(888, 'G', 8, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(889, 'G', 9, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(890, 'G', 10, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(891, 'H', 1, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(892, 'H', 2, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(893, 'H', 3, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(894, 'H', 4, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(895, 'H', 5, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(896, 'H', 6, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(897, 'H', 7, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(898, 'H', 8, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(899, 'H', 9, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(900, 'H', 10, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(901, 'I', 1, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(902, 'I', 2, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(903, 'I', 3, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(904, 'I', 4, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(905, 'I', 5, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(906, 'I', 6, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(907, 'I', 7, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(908, 'I', 8, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(909, 'I', 9, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(910, 'I', 10, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(911, 'J', 1, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(912, 'J', 2, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(913, 'J', 3, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(914, 'J', 4, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(915, 'J', 5, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(916, 'J', 6, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(917, 'J', 7, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(918, 'J', 8, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(919, 'J', 9, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL),
(920, 'J', 10, 'VIP', 5, '2025-04-11 16:42:13.267998', 8, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `Id` int(11) NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PasswordHash` varchar(100) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `Role` varchar(50) NOT NULL,
  `CreatedById` int(11) DEFAULT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedById` int(11) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 0,
  `Username` varchar(50) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`Id`, `FirstName`, `LastName`, `Email`, `PasswordHash`, `PhoneNumber`, `CreatedAt`, `Role`, `CreatedById`, `UpdatedAt`, `UpdatedById`, `IsActive`, `Username`) VALUES
(8, 'Huu Danh', 'Bui', 'danh@gmail.com', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', '0123456789', '2025-04-06 08:24:45.707729', 'Admin', NULL, NULL, NULL, 0, ''),
(14, 'Nhat Khiem', 'Ho', 'khiem@gmail.com', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', '0123456778', '2025-04-11 04:41:50.988031', 'User', 8, '2025-04-11 18:35:38.603575', 14, 0, 'nhatkhiem');

-- --------------------------------------------------------

--
-- Table structure for table `__efmigrationshistory`
--

CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) NOT NULL,
  `ProductVersion` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `__efmigrationshistory`
--

INSERT INTO `__efmigrationshistory` (`MigrationId`, `ProductVersion`) VALUES
('20250405015940_InitialCreate', '7.0.2'),
('20250405025326_RemoveDuplicateBookingSeatTable', '7.0.2'),
('20250405025813_FixBookingSeatRelationship', '7.0.2'),
('20250406012225_AddVietnamTimeZoneSupport', '7.0.2'),
('20250406022443_AddAuditableFields', '7.0.2'),
('20250406033038_AddCinemaUniqueConstraints', '7.0.2'),
('20250411061904_UpdateScreeningPriceForVND', '7.0.2'),
('20250411075627_AddPaymentFields', '7.0.2'),
('20250411091347_AddEndDateToMovie', '7.0.2'),
('20250416051909_AddTrailerUrlToMovies', '7.0.2');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Bookings_ScreeningId` (`ScreeningId`),
  ADD KEY `IX_Bookings_UserId` (`UserId`);

--
-- Indexes for table `bookingseats`
--
ALTER TABLE `bookingseats`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_BookingSeats_BookingId` (`BookingId`),
  ADD KEY `IX_BookingSeats_SeatId` (`SeatId`);

--
-- Indexes for table `cinemahalls`
--
ALTER TABLE `cinemahalls`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_CinemaHalls_CinemaId` (`CinemaId`),
  ADD KEY `IX_CinemaHalls_CreatedById` (`CreatedById`),
  ADD KEY `IX_CinemaHalls_UpdatedById` (`UpdatedById`);

--
-- Indexes for table `cinemas`
--
ALTER TABLE `cinemas`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_Cinemas_Address` (`Address`),
  ADD UNIQUE KEY `IX_Cinemas_Name` (`Name`),
  ADD KEY `IX_Cinemas_CreatedById` (`CreatedById`),
  ADD KEY `IX_Cinemas_UpdatedById` (`UpdatedById`);

--
-- Indexes for table `movies`
--
ALTER TABLE `movies`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Movies_CreatedById` (`CreatedById`),
  ADD KEY `IX_Movies_UpdatedById` (`UpdatedById`);

--
-- Indexes for table `screenings`
--
ALTER TABLE `screenings`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Screenings_CinemaHallId` (`CinemaHallId`),
  ADD KEY `IX_Screenings_MovieId` (`MovieId`),
  ADD KEY `IX_Screenings_CreatedById` (`CreatedById`),
  ADD KEY `IX_Screenings_UpdatedById` (`UpdatedById`);

--
-- Indexes for table `seats`
--
ALTER TABLE `seats`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Seats_CinemaHallId` (`CinemaHallId`),
  ADD KEY `IX_Seats_CreatedById` (`CreatedById`),
  ADD KEY `IX_Seats_UpdatedById` (`UpdatedById`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_Users_Email` (`Email`);

--
-- Indexes for table `__efmigrationshistory`
--
ALTER TABLE `__efmigrationshistory`
  ADD PRIMARY KEY (`MigrationId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookingseats`
--
ALTER TABLE `bookingseats`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cinemahalls`
--
ALTER TABLE `cinemahalls`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `cinemas`
--
ALTER TABLE `cinemas`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `movies`
--
ALTER TABLE `movies`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `screenings`
--
ALTER TABLE `screenings`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=494;

--
-- AUTO_INCREMENT for table `seats`
--
ALTER TABLE `seats`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=921;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `FK_Bookings_Screenings_ScreeningId` FOREIGN KEY (`ScreeningId`) REFERENCES `screenings` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_Bookings_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `bookingseats`
--
ALTER TABLE `bookingseats`
  ADD CONSTRAINT `FK_BookingSeats_Bookings_BookingId` FOREIGN KEY (`BookingId`) REFERENCES `bookings` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_BookingSeats_Seats_SeatId` FOREIGN KEY (`SeatId`) REFERENCES `seats` (`Id`);

--
-- Constraints for table `cinemahalls`
--
ALTER TABLE `cinemahalls`
  ADD CONSTRAINT `FK_CinemaHalls_Cinemas_CinemaId` FOREIGN KEY (`CinemaId`) REFERENCES `cinemas` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_CinemaHalls_Users_CreatedById` FOREIGN KEY (`CreatedById`) REFERENCES `users` (`Id`),
  ADD CONSTRAINT `FK_CinemaHalls_Users_UpdatedById` FOREIGN KEY (`UpdatedById`) REFERENCES `users` (`Id`);

--
-- Constraints for table `cinemas`
--
ALTER TABLE `cinemas`
  ADD CONSTRAINT `FK_Cinemas_Users_CreatedById` FOREIGN KEY (`CreatedById`) REFERENCES `users` (`Id`),
  ADD CONSTRAINT `FK_Cinemas_Users_UpdatedById` FOREIGN KEY (`UpdatedById`) REFERENCES `users` (`Id`);

--
-- Constraints for table `movies`
--
ALTER TABLE `movies`
  ADD CONSTRAINT `FK_Movies_Users_CreatedById` FOREIGN KEY (`CreatedById`) REFERENCES `users` (`Id`),
  ADD CONSTRAINT `FK_Movies_Users_UpdatedById` FOREIGN KEY (`UpdatedById`) REFERENCES `users` (`Id`);

--
-- Constraints for table `screenings`
--
ALTER TABLE `screenings`
  ADD CONSTRAINT `FK_Screenings_CinemaHalls_CinemaHallId` FOREIGN KEY (`CinemaHallId`) REFERENCES `cinemahalls` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_Screenings_Movies_MovieId` FOREIGN KEY (`MovieId`) REFERENCES `movies` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_Screenings_Users_CreatedById` FOREIGN KEY (`CreatedById`) REFERENCES `users` (`Id`),
  ADD CONSTRAINT `FK_Screenings_Users_UpdatedById` FOREIGN KEY (`UpdatedById`) REFERENCES `users` (`Id`);

--
-- Constraints for table `seats`
--
ALTER TABLE `seats`
  ADD CONSTRAINT `FK_Seats_CinemaHalls_CinemaHallId` FOREIGN KEY (`CinemaHallId`) REFERENCES `cinemahalls` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_Seats_Users_CreatedById` FOREIGN KEY (`CreatedById`) REFERENCES `users` (`Id`),
  ADD CONSTRAINT `FK_Seats_Users_UpdatedById` FOREIGN KEY (`UpdatedById`) REFERENCES `users` (`Id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
