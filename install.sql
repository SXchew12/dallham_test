-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 18, 2024 at 10:48 AM
-- Server version: 10.11.8-MariaDB-cll-lve
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u687661449_dallham4`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(999) DEFAULT 'admin',
  `uid` varchar(999) DEFAULT NULL,
  `email` varchar(999) DEFAULT NULL,
  `password` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `role`, `uid`, `email`, `password`, `createdAt`) VALUES
(1, 'admin', 'lnAnUIUnBBtXhcj5VHdaA2KERBgCTkWz', 'admin@admin.com', '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6', '2024-07-21 13:59:47');

-- Add a test user with full access plan
INSERT INTO `user` (`id`, `role`, `uid`, `name`, `email`, `password`, `mobile`, `timezone`, `plan`, `plan_expire`, `trial`, `api_key`, `gemini_token`, `openai_token`, `createdAt`) VALUES 
(1, 'user', 'testuser123', 'Test User', 'test@test.com', '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6', '1234567890', 'UTC', '{"id":1,"name":"Full Access","price":"0","in_app_chat":1,"image_maker":1,"code_writer":1,"speech_to_text":1,"voice_maker":1,"ai_video":1,"validity_days":"365","gemini_token":"999999","openai_token":"999999"}', '1735689600000', 0, NULL, '999999', '999999', CURRENT_TIMESTAMP);

-- Add a free plan for testing
INSERT INTO `plan` (`id`, `name`, `price`, `in_app_chat`, `image_maker`, `code_writer`, `speech_to_text`, `voice_maker`, `ai_video`, `validity_days`, `gemini_token`, `openai_token`, `createdAt`) VALUES
(1, 'Test Plan', '0', 1, 1, 1, 1, 1, 1, '365', '999999', '999999', CURRENT_TIMESTAMP);

-- --------------------------------------------------------

--
-- Table structure for table `ai_image`
--

CREATE TABLE `ai_image` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(999) DEFAULT NULL,
  `ai_type` varchar(999) DEFAULT NULL,
  `image_size` varchar(999) DEFAULT NULL,
  `image_style` varchar(999) DEFAULT NULL,
  `prompt` varchar(999) DEFAULT NULL,
  `filename` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_image`
--

INSERT INTO `ai_image` (`id`, `uid`, `ai_type`, `image_size`, `image_style`, `prompt`, `filename`, `createdAt`) VALUES
(8, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'OPENAI', '512x512', 'cinematic', 'Create a vivid and detailed digital painting of a futuristic city skyline at sunset. The skyline features towering skyscrapers with a mix of glass and metal, some with glowing neon lights.', 'DofD.png', '2024-08-18 09:00:54'),
(9, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'OPENAI', '512x512', 'analog-film', 'Generate a serene landscape of a dense forest during autumn. The trees are tall and golden, with leaves gently falling to the ground', 'xjdO.png', '2024-08-18 09:01:52');

-- --------------------------------------------------------

--
-- Table structure for table `ai_model`
--

CREATE TABLE `ai_model` (
  `id` int(11) NOT NULL,
  `model_id` varchar(999) DEFAULT NULL,
  `uid` varchar(999) DEFAULT NULL,
  `name` varchar(999) DEFAULT NULL,
  `icon` varchar(999) DEFAULT NULL,
  `train_data` longtext DEFAULT NULL,
  `openai_model` varchar(999) DEFAULT NULL,
  `ai_type` varchar(999) DEFAULT NULL COMMENT 'GEMINI, OPENAI',
  `memory` bigint(20) DEFAULT 0,
  `createdAt` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_model`
--

INSERT INTO `ai_model` (`id`, `model_id`, `uid`, `name`, `icon`, `train_data`, `openai_model`, `ai_type`, `memory`, `createdAt`) VALUES
(15, 'codeyon-it-services-support', 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'Codeyon It Services support', '2VwIzz5br6h6JD91LI3qEHe0jLGjTF09.png', 'You are a helpful assistant of codeyon it services: codeyon.com\nwe offer it services on best quality and custom saas software \nour opening ours are 10AM to 6PM Monday to Friday', 'gpt-4o', 'OPENAI', 3, '2024-08-17 17:20:42');

-- --------------------------------------------------------

--
-- Table structure for table `ai_speech`
--

CREATE TABLE `ai_speech` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(999) DEFAULT NULL,
  `type` varchar(999) DEFAULT NULL,
  `filename` varchar(999) DEFAULT NULL,
  `output` longtext DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_speech`
--

INSERT INTO `ai_speech` (`id`, `uid`, `type`, `filename`, `output`, `createdAt`) VALUES
(4, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'text', 'NBPZUWc3aFjJVoBSFPOQBKtHhI7fNo5P.mp3', 'My thought, I have nobody by a beauty and will as you t\'ward. Mr. Rochester is sub, and that so don\'t find simpus, And devoted abode, to hath might in a', '2024-08-01 14:23:54'),
(5, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'word', 'yQCdqeW2WxLb3FGtyicdyuh1kit1EbOG.mp3', '{\"task\":\"transcribe\",\"language\":\"english\",\"duration\":10.039999961853027,\"text\":\"My thought, I have nobody by a beauty and will as you t\'ward. Mr. Rochester is sub, and that so don\'t find simpus, And devoted abode, to hath might in a\",\"words\":[{\"word\":\"My\",\"start\":0,\"end\":0.4399999976158142},{\"word\":\"thought\",\"start\":0.4399999976158142,\"end\":0.8199999928474426},{\"word\":\"I\",\"start\":1.0199999809265137,\"end\":1.0199999809265137},{\"word\":\"have\",\"start\":1.0199999809265137,\"end\":1.2000000476837158},{\"word\":\"nobody\",\"start\":1.2000000476837158,\"end\":1.5399999618530273},{\"word\":\"by\",\"start\":1.5399999618530273,\"end\":1.7599999904632568},{\"word\":\"a\",\"start\":1.7599999904632568,\"end\":1.899999976158142},{\"word\":\"beauty\",\"start\":1.899999976158142,\"end\":2.140000104904175},{\"word\":\"and\",\"start\":2.140000104904175,\"end\":2.359999895095825},{\"word\":\"will\",\"start\":2.359999895095825,\"end\":2.4600000381469727},{\"word\":\"as\",\"start\":2.4600000381469727,\"end\":2.6600000858306885},{\"word\":\"you\",\"start\":2.6600000858306885,\"end\":2.8399999141693115},{\"word\":\"t\",\"start\":2.8399999141693115,\"end\":3.0199999809265137},{\"word\":\"ward\",\"start\":3.0199999809265137,\"end\":3.119999885559082},{\"word\":\"Mr\",\"start\":3.9000000953674316,\"end\":4.179999828338623},{\"word\":\"Rochester\",\"start\":4.21999979019165,\"end\":4.739999771118164},{\"word\":\"is\",\"start\":4.739999771118164,\"end\":5},{\"word\":\"sub\",\"start\":5,\"end\":5.21999979019165},{\"word\":\"and\",\"start\":5.320000171661377,\"end\":5.440000057220459},{\"word\":\"that\",\"start\":5.440000057220459,\"end\":5.639999866485596},{\"word\":\"so\",\"start\":5.639999866485596,\"end\":5.800000190734863},{\"word\":\"don\'t\",\"start\":5.800000190734863,\"end\":6.039999961853027},{\"word\":\"find\",\"start\":6.039999961853027,\"end\":6.380000114440918},{\"word\":\"simpus\",\"start\":6.380000114440918,\"end\":6.840000152587891},{\"word\":\"And\",\"start\":7.340000152587891,\"end\":7.559999942779541},{\"word\":\"devoted\",\"start\":7.559999942779541,\"end\":7.900000095367432},{\"word\":\"abode\",\"start\":7.900000095367432,\"end\":8.460000038146973},{\"word\":\"to\",\"start\":9.079999923706055,\"end\":9.279999732971191},{\"word\":\"hath\",\"start\":9.279999732971191,\"end\":9.420000076293945},{\"word\":\"might\",\"start\":9.420000076293945,\"end\":9.699999809265137},{\"word\":\"in\",\"start\":9.699999809265137,\"end\":9.899999618530273},{\"word\":\"a\",\"start\":9.899999618530273,\"end\":10.020000457763672}]}', '2024-08-01 15:17:46');

-- --------------------------------------------------------

--
-- Table structure for table `ai_video`
--

CREATE TABLE `ai_video` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(999) DEFAULT NULL,
  `audio` varchar(999) DEFAULT NULL,
  `video` varchar(999) DEFAULT NULL,
  `caption` longtext DEFAULT NULL,
  `final_video` varchar(999) DEFAULT NULL,
  `status` varchar(999) DEFAULT NULL,
  `state` longtext DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_video`
--

INSERT INTO `ai_video` (`id`, `uid`, `audio`, `video`, `caption`, `final_video`, `status`, `state`, `createdAt`) VALUES
(13, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'RqOR.mp3', 'r99w.mp4', '[Script Info]\n; 3D subtitles converted by node-32sub\nTitle: Hello ji\nScriptType: v4.00+\nCollisions: Normal\nPlayResX: 720\nPlayResY: 1280\nPlayDepth: 0\nTimer: 100.0000\nWrapStyle: 1\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Default,Garamond,13,&H00FFFFFF,&H000D1321,&H00B48617,&H003F97F1,1,0,0,0,720,1280,0,0,1,10,1,2,5,5,0,0\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:00.56,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}1\nDialogue: 0,0:00:00.98,0:00:01.15,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}The\nDialogue: 0,0:00:01.15,0:00:01.39,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}human\nDialogue: 0,0:00:01.39,0:00:01.70,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}brain\nDialogue: 0,0:00:01.70,0:00:02.09,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}generates\nDialogue: 0,0:00:02.09,0:00:02.48,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}about\nDialogue: 0,0:00:02.48,0:00:02.94,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}70\nDialogue: 0,0:00:02.94,0:00:03.33,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}000\nDialogue: 0,0:00:03.33,0:00:03.70,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}thoughts\nDialogue: 0,0:00:03.70,0:00:04.00,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}per\nDialogue: 0,0:00:04.00,0:00:04.23,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}day\nDialogue: 0,0:00:05.19,0:00:05.46,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}2\nDialogue: 0,0:00:05.59,0:00:06.01,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}The\nDialogue: 0,0:00:06.01,0:00:06.03,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}brain\nDialogue: 0,0:00:06.03,0:00:06.34,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}can\nDialogue: 0,0:00:06.34,0:00:06.71,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}process\nDialogue: 0,0:00:06.71,0:00:07.07,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}images\nDialogue: 0,0:00:07.07,0:00:07.55,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}as\nDialogue: 0,0:00:07.55,0:00:07.59,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}fast\nDialogue: 0,0:00:07.59,0:00:08.35,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}as\nDialogue: 0,0:00:08.35,0:00:08.35,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}13\nDialogue: 0,0:00:08.35,0:00:08.93,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}milliseconds\nDialogue: 0,0:00:09.93,0:00:10.53,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}3\nDialogue: 0,0:00:10.76,0:00:11.22,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}Emotional\nDialogue: 0,0:00:11.22,0:00:11.61,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}memories\nDialogue: 0,0:00:11.61,0:00:12.00,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}are\nDialogue: 0,0:00:12.00,0:00:12.50,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}stronger\nDialogue: 0,0:00:12.50,0:00:12.76,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}due\nDialogue: 0,0:00:12.76,0:00:12.96,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}to\nDialogue: 0,0:00:12.96,0:00:13.26,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}the\nDialogue: 0,0:00:13.26,0:00:13.77,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}amygdala\'s\nDialogue: 0,0:00:13.77,0:00:14.11,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}involvement\nDialogue: 0,0:00:14.11,0:00:15.10,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}in\nDialogue: 0,0:00:15.10,0:00:15.10,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}processing\nDialogue: 0,0:00:15.10,0:00:15.65,Default,,0,0,0,,{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)\\an5\\pos(360,640)}emotions\n', 'lW5T.mp4', 'COMPLETED', '{\"doing\":\"create\",\"step\":\"chooseOther\",\"chooseAudio\":\"ai\",\"choosedAudio\":\"\",\"choosedAudioText\":\"Number 1: The human brain generates about 70,000 thoughts per day.\\n\\nNumber 2: The brain can process images as fast as 13 milliseconds.\\n\\nNumber 3: Emotional memories are stronger due to the amygdala\'s involvement in processing emotions.\",\"chooseVideo\":\"ai\",\"choosedVideo\":\"\",\"choosedVideoImage\":[\"866G.png\",\"skg8.png\",\"cptv.png\"],\"colorDialog\":false,\"primaryColor\":\"#ffffff\",\"secondaryColor\":\"#21130d\",\"outlineColor\":\"#1786b4\",\"backgroundColor\":\"#f1973f\",\"videoResolution\":\"720x1280\",\"fontFamily\":\"Trebuchet MS\",\"fontEffect\":\"Blur T\",\"captionPosition\":\"middle\",\"language\":\"Auto\",\"fontSize\":\"13\",\"boldCaption\":false,\"outlineCaption\":true,\"captionType\":\"word\",\"transitionEffect\":\"zoom\",\"voice\":\"shimmer\"}', '2024-08-18 10:27:56'),
(16, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'LASJ.mp3', 'JfyZ.mp4', '[Script Info]\n; 3D subtitles converted by node-32sub\nTitle: Hello ji\nScriptType: v4.00+\nCollisions: Normal\nPlayResX: 720\nPlayResY: 1280\nPlayDepth: 0\nTimer: 100.0000\nWrapStyle: 1\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Default,Garamond,32,&H00000000,&H002B2BFF,&H00FFFFFF,&H003F97F1,10,0,0,0,720,1280,0,0,1,10,1,2,5,5,0,0\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:00.37,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}Three\nDialogue: 0,0:00:00.37,0:00:00.74,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}benefits\nDialogue: 0,0:00:00.74,0:00:01.01,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}of\nDialogue: 0,0:00:01.01,0:00:01.29,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}using\nDialogue: 0,0:00:01.29,0:00:01.72,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}Envato\nDialogue: 0,0:00:01.72,0:00:02.09,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}One\nDialogue: 0,0:00:02.88,0:00:02.88,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}Access\nDialogue: 0,0:00:02.88,0:00:03.09,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}to\nDialogue: 0,0:00:03.09,0:00:03.24,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}a\nDialogue: 0,0:00:03.24,0:00:03.46,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}vast\nDialogue: 0,0:00:03.46,0:00:03.83,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}library\nDialogue: 0,0:00:03.83,0:00:04.19,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}of\nDialogue: 0,0:00:04.19,0:00:04.34,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}high\nDialogue: 0,0:00:04.34,0:00:04.71,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}quality\nDialogue: 0,0:00:04.71,0:00:05.19,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}digital\nDialogue: 0,0:00:05.19,0:00:05.55,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}assets\nDialogue: 0,0:00:05.55,0:00:05.90,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}for\nDialogue: 0,0:00:05.90,0:00:06.36,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}creative\nDialogue: 0,0:00:06.36,0:00:06.92,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}projects\nDialogue: 0,0:00:07.59,0:00:08.11,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}Two\nDialogue: 0,0:00:08.18,0:00:08.23,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}cost\nDialogue: 0,0:00:08.23,0:00:08.60,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}effective\nDialogue: 0,0:00:08.60,0:00:09.07,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}subscription\nDialogue: 0,0:00:09.07,0:00:09.47,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}plans\nDialogue: 0,0:00:09.47,0:00:09.73,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}with\nDialogue: 0,0:00:09.73,0:00:10.11,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}unlimited\nDialogue: 0,0:00:10.11,0:00:10.60,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}downloads\nDialogue: 0,0:00:11.42,0:00:11.46,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}Three\nDialogue: 0,0:00:11.80,0:00:12.11,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}regularly\nDialogue: 0,0:00:12.11,0:00:12.60,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}updated\nDialogue: 0,0:00:12.60,0:00:13.14,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}content\nDialogue: 0,0:00:13.14,0:00:13.50,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}across\nDialogue: 0,0:00:13.50,0:00:13.93,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}various\nDialogue: 0,0:00:13.93,0:00:14.35,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}categories\nDialogue: 0,0:00:14.35,0:00:14.69,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}like\nDialogue: 0,0:00:14.69,0:00:15.11,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}graphics\nDialogue: 0,0:00:15.73,0:00:15.73,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}templates\nDialogue: 0,0:00:15.73,0:00:16.26,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}and\nDialogue: 0,0:00:16.26,0:00:16.37,Default,,0,0,0,,{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)\\an2\\pos(360,1230)}audio\n', 'k6Mh.mp4', 'COMPLETED', '{\"doing\":\"create\",\"step\":\"chooseOther\",\"chooseAudio\":\"ai\",\"choosedAudio\":\"\",\"choosedAudioText\":\"3 benifist of using Envato\\n\\n\\n1: Access to a vast library of high-quality digital assets for creative projects.\\n\\n2: Cost-effective subscription plans with unlimited downloads.\\n\\n3: Regularly updated content across various categories like graphics, templates, and audio.\",\"chooseVideo\":\"ai\",\"choosedVideo\":\"\",\"choosedVideoImage\":[\"2iID.png\",\"sZ3x.png\",\"OpOr.png\"],\"colorDialog\":false,\"primaryColor\":\"#000000\",\"secondaryColor\":\"#ff2b2b\",\"outlineColor\":\"#ffffff\",\"backgroundColor\":\"#f1973f\",\"videoResolution\":\"720x1280\",\"fontFamily\":\"Tahoma\",\"fontEffect\":\"Fscy\",\"captionPosition\":\"bottom\",\"language\":\"Auto\",\"fontSize\":32,\"boldCaption\":true,\"outlineCaption\":true,\"captionType\":\"word\",\"transitionEffect\":\"zoom\",\"voice\":\"fable\"}', '2024-08-18 10:35:40');

-- --------------------------------------------------------

--
-- Table structure for table `ai_voice`
--

CREATE TABLE `ai_voice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(999) DEFAULT NULL,
  `prompt` longtext DEFAULT NULL,
  `voice` varchar(999) DEFAULT NULL,
  `filename` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_voice`
--

INSERT INTO `ai_voice` (`id`, `uid`, `prompt`, `voice`, `filename`, `createdAt`) VALUES
(2, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'His palms are sweaty, knees weak, arms are heavy\nThere\'s vomit on his sweater already, mom\'s spaghetti\nHe\'s nervous, but on the surface, he looks calm and ready\nTo drop bombs, but he keeps on forgetting\nWhat he wrote down, the whole crowd goes so loud\nHe opens his mouth, but the words won\'t come out\nHe\'s chokin\', how? Everybody\'s jokin\' now\nThe clock\'s run out, time\'s up, over, blaow\nSnap back to reality, ope, there goes gravity\nOpe, there goes Rabbit, he choked, he\'s so mad\nBut he won\'t give up that easy, no, he won\'t have it\nHe knows his whole back\'s to these ropes, it don\'t matter\nHe\'s dope, he knows that, but he\'s broke, he\'s so stagnant\nHe knows when he goes back to this mobile home, that\'s when', 'fable', 'BByH.mp3', '2024-08-01 16:14:46');

-- --------------------------------------------------------

--
-- Table structure for table `api_keys`
--

CREATE TABLE `api_keys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `open_ai` varchar(999) DEFAULT NULL,
  `gemini_ai` varchar(999) DEFAULT NULL,
  `stable_diffusion` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_keys`
--

INSERT INTO `api_keys` (`id`, `open_ai`, `gemini_ai`, `stable_diffusion`, `createdAt`) VALUES
(1, 'sk-proj-KA3vYIRjJ1gJ81DB4L2uT3BlbkFJtDiMXXXXXXXXXXX', 'AIzaSyA27vzeSnobuj1a67XJd_MXXXXXXXXXXX', 'sk-f9WeKwC7YuZAgS0wzTLDk4kO84fpRNDa8OMXXXXXXXXXXX', '2024-07-30 14:32:04');

-- --------------------------------------------------------

--
-- Table structure for table `chat`
--

CREATE TABLE `chat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chat_id` varchar(999) DEFAULT NULL,
  `uid` varchar(999) DEFAULT NULL,
  `title` varchar(999) DEFAULT NULL,
  `model_id` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat`
--

INSERT INTO `chat` (`id`, `chat_id`, `uid`, `title`, `model_id`, `createdAt`) VALUES
(19, 'efQ2', 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'codeyon-it-services-support', 'codeyon-it-services-support', '2024-08-17 17:20:55');

-- --------------------------------------------------------

--
-- Table structure for table `contact_form`
--

CREATE TABLE `contact_form` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(999) DEFAULT NULL,
  `name` varchar(999) DEFAULT NULL,
  `mobile` varchar(999) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_form`
--

INSERT INTO `contact_form` (`id`, `email`, `name`, `mobile`, `content`, `createdAt`) VALUES
(1, 'john@gmail.com', 'John Doe', '8888889999', 'hey there! you are awesome!', '2024-08-12 14:10:16');

-- --------------------------------------------------------

--
-- Table structure for table `embed_chatbot`
--

CREATE TABLE `embed_chatbot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(999) DEFAULT NULL,
  `model_id` varchar(999) DEFAULT NULL,
  `bot_id` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `embed_chatbot`
--

INSERT INTO `embed_chatbot` (`id`, `uid`, `model_id`, `bot_id`, `createdAt`) VALUES
(2, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', '13', 'HKP75', '2024-08-10 11:09:20');

-- --------------------------------------------------------

--
-- Table structure for table `embed_chats`
--

CREATE TABLE `embed_chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bot_id` varchar(999) DEFAULT NULL,
  `user_email` varchar(999) DEFAULT NULL,
  `user_mobile` varchar(999) DEFAULT NULL,
  `user_name` varchar(999) DEFAULT NULL,
  `chat_id` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `embed_chats`
--

INSERT INTO `embed_chats` (`id`, `bot_id`, `user_email`, `user_mobile`, `user_name`, `chat_id`, `createdAt`) VALUES
(6, 'HKP75', 'john@gmail.com', '777897', 'john', 'kPEK', '2024-08-10 11:24:22');

-- --------------------------------------------------------

--
-- Table structure for table `faq`
--

CREATE TABLE `faq` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` longtext DEFAULT NULL,
  `answer` longtext DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faq`
--

INSERT INTO `faq` (`id`, `question`, `answer`, `createdAt`) VALUES
(2, 'Can I use my existing Ai for my person use?', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed facilisis sed magna nec pharetra. Donec nisi nibh, efficitur sed turpis nec, aliquet cursus dolor. Suspendisse vitae mi elit. In mattis lorem eget mi tristique vehicula. Vivamus luctus fringilla felis, sed tincidunt libero sodales porttitor. Duis bibendum eget dui a blandit. Nam non vestibulum justo. Sed quis sollicitudin nisl, at laoreet ante.', '2024-08-12 13:42:06'),
(3, 'Can I use my existing Ai for my person use?', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed facilisis sed magna nec pharetra. Donec nisi nibh, efficitur sed turpis nec, aliquet cursus dolor. Suspendisse vitae mi elit. In mattis lorem eget mi tristique vehicula. Vivamus luctus fringilla felis, sed tincidunt libero sodales porttitor. Duis bibendum eget dui a blandit. Nam non vestibulum justo. Sed quis sollicitudin nisl, at laoreet ante.', '2024-08-12 13:42:09'),
(4, 'Can I use my existing Ai for my person use?', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed facilisis sed magna nec pharetra. Donec nisi nibh, efficitur sed turpis nec, aliquet cursus dolor. Suspendisse vitae mi elit. In mattis lorem eget mi tristique vehicula. Vivamus luctus fringilla felis, sed tincidunt libero sodales porttitor. Duis bibendum eget dui a blandit. Nam non vestibulum justo. Sed quis sollicitudin nisl, at laoreet ante.', '2024-08-12 13:42:13'),
(5, 'Can I use my existing Ai for my person use?', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed facilisis sed magna nec pharetra. Donec nisi nibh, efficitur sed turpis nec, aliquet cursus dolor. Suspendisse vitae mi elit. In mattis lorem eget mi tristique vehicula. Vivamus luctus fringilla felis, sed tincidunt libero sodales porttitor. Duis bibendum eget dui a blandit. Nam non vestibulum justo. Sed quis sollicitudin nisl, at laoreet ante.', '2024-08-12 13:42:16');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(999) DEFAULT NULL,
  `payment_mode` varchar(999) DEFAULT NULL,
  `amount` varchar(999) DEFAULT NULL,
  `data` longtext DEFAULT NULL,
  `s_token` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `uid`, `payment_mode`, `amount`, `data`, `s_token`, `createdAt`) VALUES
(1, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'OFFLINE', '399', '{\"success\":true,\"mode\":\"OFFLINE\"}', NULL, '2024-07-27 09:17:49'),
(2, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'OFFLINE', '499', '{\"success\":true,\"mode\":\"OFFLINE\"}', NULL, '2024-07-27 09:23:31'),
(3, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'OFFLINE', '123', '{\"success\":true,\"mode\":\"OFFLINE\"}', NULL, '2024-07-27 09:31:18'),
(4, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'OFFLINE', '399', '{\"success\":true,\"mode\":\"OFFLINE\"}', NULL, '2024-07-27 09:31:21'),
(5, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'OFFLINE', '499', '{\"success\":true,\"mode\":\"OFFLINE\"}', NULL, '2024-08-30 14:25:25'),
(6, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'OFFLINE', '499', '{\"success\":true,\"mode\":\"OFFLINE\"}', NULL, '2024-08-30 08:13:44'),
(7, 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'STRIPE', '123', 'STRIPE_QDDzOfsIgVetKriA4SKHheTZN168DCI6', NULL, '2024-08-12 14:19:42');

-- --------------------------------------------------------

--
-- Table structure for table `page`
--

CREATE TABLE `page` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(999) DEFAULT NULL,
  `title` varchar(999) DEFAULT NULL,
  `image` varchar(999) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `permanent` int(1) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `page`
--

INSERT INTO `page` (`id`, `slug`, `title`, `image`, `content`, `permanent`, `createdAt`) VALUES
(3, 'privacy-policy', 'Privacy policy', 'undraw_Images_re_0kll.svg', '<p>hey i am privacy policya</p>', 1, '2024-02-28 09:21:17'),
(4, 'terms-and-conditions', 'termns', 'undraw_Images_re_0kll.svg', '<p>Terms Pagea</p>', 1, '2024-02-28 09:26:11'),
(12, 'unlocking-growth-potential', 'Unlocking Growth Potential', 'undraw_Images_re_0kll.svg', '<p>In the fast-paced world of business, staying ahead of the competition requires innovative strategies that prioritize customer engagement and satisfaction. Cloud-Based WhatsApp CRM emerges as a game-changer, offering businesses a powerful platform to connect with customers, streamline operations, and drive growth. Let\'s delve into how Cloud-Based WhatsApp CRM solutions can unlock the full potential of your business and propel it towards success.</p><p><span style=\"color: var(--tw-prose-bold);\">Revolutionizing Customer Engagement with Cloud-Based WhatsApp CRM:</span></p><p><br></p><p><br></p><ol><li><span style=\"color: var(--tw-prose-bold);\">Seamless Communication:</span>&nbsp;Break down communication barriers and connect with customers in real-time through WhatsApp\'s intuitive messaging interface, fostering instant engagement and responsiveness.</li><li><span style=\"color: var(--tw-prose-bold);\">Automated Workflows:</span>&nbsp;Streamline routine tasks and workflows with automated features, such as chatbots and broadcast messages, allowing businesses to focus on high-value activities and strategic initiatives.</li><li><span style=\"color: var(--tw-prose-bold);\">Personalized Interactions:</span>&nbsp;Tailor messages and offers to individual customer preferences, leveraging data insights and segmentation to deliver hyper-targeted content that resonates with your audience.</li><li><span style=\"color: var(--tw-prose-bold);\">Multi-Channel Integration:</span>&nbsp;Integrate WhatsApp CRM with existing communication channels, such as email and social media, to create a unified customer experience across touchpoints and channels.</li><li><span style=\"color: var(--tw-prose-bold);\">Actionable Analytics:</span>&nbsp;Gain valuable insights into customer behavior, campaign performance, and ROI through advanced analytics and reporting, enabling data-driven decision-making and continuous improvement.</li></ol><p><span style=\"color: var(--tw-prose-bold);\">Key Benefits of Cloud-Based WhatsApp CRM for Business Success:</span></p><p><br></p><p><br></p><ul><li><span style=\"color: var(--tw-prose-bold);\">Scalability:</span>&nbsp;Scale your operations effortlessly to meet growing customer demand, with the flexibility to add new features and functionalities as your business evolves.</li><li><span style=\"color: var(--tw-prose-bold);\">Efficiency:</span>&nbsp;Streamline processes and workflows, reduce manual intervention, and increase operational efficiency, allowing your team to focus on strategic objectives and business growth.</li><li><span style=\"color: var(--tw-prose-bold);\">Customer Satisfaction:</span>&nbsp;Deliver exceptional service and support through personalized interactions, proactive communication, and timely responses, earning customer loyalty and trust.</li><li><span style=\"color: var(--tw-prose-bold);\">Competitive Advantage:</span>&nbsp;Stay ahead of the competition by leveraging innovative technology solutions that enhance customer engagement, drive innovation, and position your business as an industry leader.</li></ul><p><span style=\"color: var(--tw-prose-bold);\">Unlock Your Business Potential with Cloud-Based WhatsApp CRM:</span></p><p>Embrace the power of Cloud-Based WhatsApp CRM solutions to transform the way you engage with customers, streamline operations, and drive business growth. By harnessing the capabilities of WhatsApp CRM, businesses can unlock new opportunities, cultivate meaningful relationships with customers, and achieve sustainable success in today\'s dynamic marketplace. Take the next step towards business excellence and unleash your growth potential with Cloud-Based WhatsApp CRM.</p>', 0, '2024-03-08 04:28:29'),
(13, 'unlocking-business-potential', 'Unlocking Business Potential', 'undraw_Images_re_0kll.svg', '<p>In today\'s digital age, staying connected with customers is paramount for businesses across industries. With the widespread use of messaging platforms like WhatsApp, leveraging a Cloud-Based WhatsApp CRM (Customer Relationship Management) solution has become essential for organizations looking to streamline communication, enhance customer engagement, and drive growth.</p><p>At the forefront of this revolution is cloud-based WhatsApp CRM technology, offering a comprehensive suite of features designed to empower businesses with advanced communication capabilities. From broadcasting messages to managing online chats and deploying chatbots, these solutions provide a centralized platform for businesses to interact with customers efficiently and effectively.</p><p><span style=\"color: var(--tw-prose-bold);\">Key Features of Cloud-Based WhatsApp CRM Solutions:</span></p><p><br></p><p><br></p><ol><li><span style=\"color: var(--tw-prose-bold);\">Broadcast Messaging:</span>&nbsp;Reach a large audience instantly with broadcast messages, allowing businesses to disseminate important updates, promotions, and announcements seamlessly.</li><li><span style=\"color: var(--tw-prose-bold);\">Online Chat Management:</span>&nbsp;Manage customer inquiries and support requests in real-time through WhatsApp\'s popular chat interface, ensuring swift responses and excellent customer service.</li><li><span style=\"color: var(--tw-prose-bold);\">Chatbot Integration:</span>&nbsp;Automate routine interactions and FAQs using intelligent chatbots, enabling businesses to handle a high volume of inquiries while reducing manual workload.</li><li><span style=\"color: var(--tw-prose-bold);\">CRM Integration:</span>&nbsp;Integrate with existing CRM systems to centralize customer data and interactions, providing valuable insights into customer behavior and preferences.</li><li><span style=\"color: var(--tw-prose-bold);\">Analytics and Reporting:</span>&nbsp;Gain valuable insights into campaign performance, chat metrics, and customer engagement through advanced analytics and reporting tools.</li></ol><p><span style=\"color: var(--tw-prose-bold);\">Benefits of Cloud-Based WhatsApp CRM Solutions:</span></p><p><br></p><p><br></p><ul><li><span style=\"color: var(--tw-prose-bold);\">Enhanced Customer Engagement:</span>&nbsp;Build stronger relationships with customers through personalized communication and timely responses.</li><li><span style=\"color: var(--tw-prose-bold);\">Increased Efficiency:</span>&nbsp;Streamline communication workflows, automate repetitive tasks, and optimize resource allocation for improved operational efficiency.</li><li><span style=\"color: var(--tw-prose-bold);\">Scalability:</span>&nbsp;Scale your communication efforts effortlessly to accommodate business growth and evolving customer needs.</li><li><span style=\"color: var(--tw-prose-bold);\">Cost-Effectiveness:</span>&nbsp;Reduce overhead costs associated with traditional communication channels while maximizing ROI through targeted messaging and automation.</li></ul><p><span style=\"color: var(--tw-prose-bold);\">Unlock Your Business Potential with Cloud-Based WhatsApp CRM Solutions:</span></p><p>Whether you\'re a small business looking to enhance customer service or a large enterprise seeking to streamline communication processes, cloud-based WhatsApp CRM solutions offer a powerful platform to elevate your business to new heights. Embrace the future of customer engagement and harness the full potential of WhatsApp as a business communication tool with innovative cloud-based CRM solutions tailored to your needs.</p>', 0, '2024-03-08 04:28:50'),
(14, 'customer-experience', 'Customer Experience', 'undraw_Images_re_0kll.svg', '<p>In the digital era, customer experience reigns supreme, and businesses are continually seeking innovative ways to engage with their audience effectively. Enter Cloud-Based WhatsApp CRM solutions, revolutionizing the way businesses interact with customers and deliver exceptional service. Let\'s explore how these cutting-edge solutions are transforming customer experience across industries.</p><p><span style=\"color: var(--tw-prose-bold);\">Transforming Customer Experience with Cloud-Based WhatsApp CRM:</span></p><p><br></p><p><br></p><ol><li><span style=\"color: var(--tw-prose-bold);\">Personalized Communication:</span>&nbsp;Leverage the power of WhatsApp\'s familiar chat interface to engage customers on a personal level, fostering stronger connections and loyalty.</li><li><span style=\"color: var(--tw-prose-bold);\">Instant Responsiveness:</span>&nbsp;With real-time notifications and alerts, businesses can respond to customer inquiries promptly, ensuring a seamless and frictionless experience.</li><li><span style=\"color: var(--tw-prose-bold);\">Omnichannel Integration:</span>&nbsp;Integrate WhatsApp CRM with other communication channels, such as email and SMS, to provide customers with multiple touchpoints for communication.</li><li><span style=\"color: var(--tw-prose-bold);\">AI-Powered Insights:</span>&nbsp;Harness the potential of artificial intelligence (AI) to analyze customer interactions, sentiment, and preferences, enabling personalized recommendations and targeted marketing campaigns.</li><li><span style=\"color: var(--tw-prose-bold);\">Interactive Chatbots:</span>&nbsp;Deploy intelligent chatbots to handle routine inquiries, guide customers through the buying process, and provide round-the-clock support, enhancing efficiency and customer satisfaction.</li></ol><p><span style=\"color: var(--tw-prose-bold);\">Benefits of Cloud-Based WhatsApp CRM for Customer Experience:</span></p><p><br></p><p><br></p><ul><li><span style=\"color: var(--tw-prose-bold);\">Enhanced Engagement:</span>&nbsp;Connect with customers on their preferred messaging platform, delivering tailored messages and offers that resonate with their needs and interests.</li><li><span style=\"color: var(--tw-prose-bold);\">Effortless Communication:</span>&nbsp;Seamlessly transition between chats, calls, and multimedia sharing within the WhatsApp ecosystem, simplifying communication for both businesses and customers.</li><li><span style=\"color: var(--tw-prose-bold);\">Data-Driven Insights:</span>&nbsp;Gain valuable insights into customer behavior, preferences, and trends through advanced analytics, enabling informed decision-making and targeted marketing strategies.</li><li><span style=\"color: var(--tw-prose-bold);\">Brand Loyalty:</span>&nbsp;By providing exceptional service and personalized interactions, businesses can build long-lasting relationships with customers, fostering loyalty and advocacy.</li></ul><p><span style=\"color: var(--tw-prose-bold);\">Elevate Your Customer Experience with Cloud-Based WhatsApp CRM:</span></p><p>In today\'s competitive landscape, delivering exceptional customer experience is no longer optional—it\'s imperative. By harnessing the power of Cloud-Based WhatsApp CRM solutions, businesses can elevate their customer experience to new heights, delighting customers at every touchpoint and driving sustainable growth. Embrace the future of customer engagement with innovative WhatsApp CRM solutions tailored to your business needs, and embark on a journey to create memorable experiences that keep customers coming back for more.</p>', 0, '2024-03-08 04:29:06');

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `partners`
--

INSERT INTO `partners` (`id`, `filename`, `createdAt`) VALUES
(9, 'fxStGsO9qKfmSmWMdcOPfrS9pwFLt2Eu.png', '2024-08-12 13:41:04'),
(10, 'j9FQmZX6EJSuajlTCUPAY4Agx6V9Hk5x.png', '2024-08-12 13:41:06'),
(11, 'rFXC0E7rYDTPWJqj4OgtC5c3yWzZm8JG.png', '2024-08-12 13:41:10'),
(12, '4nlb59JtlWzfpeakghVq6euVATylX8bH.png', '2024-08-12 13:41:12'),
(13, 'vCA14hYDiGmWyeSSGApOaw9N7TvA4Mgq.png', '2024-08-12 13:41:14'),
(14, 'mIBeGbjVMayaG3rmP5HjgCL2AIrUn5ue.png', '2024-08-12 13:41:16'),
(15, 'KpcdooYZFL7cmqC8IKNK1WrdZvRVpFDY.png', '2024-08-12 13:41:19');

-- --------------------------------------------------------

--
-- Table structure for table `plan`
--

CREATE TABLE `plan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(999) DEFAULT NULL,
  `price` varchar(999) DEFAULT NULL,
  `in_app_chat` int(1) DEFAULT 0,
  `image_maker` int(1) DEFAULT 0,
  `code_writer` int(1) DEFAULT 0,
  `speech_to_text` int(1) DEFAULT 0,
  `voice_maker` int(1) DEFAULT 0,
  `ai_video` int(1) DEFAULT 0,
  `validity_days` varchar(999) DEFAULT '0',
  `gemini_token` varchar(999) DEFAULT '0',
  `openai_token` varchar(999) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `plan`
--

INSERT INTO `plan` (`id`, `name`, `price`, `in_app_chat`, `image_maker`, `code_writer`, `speech_to_text`, `voice_maker`, `ai_video`, `validity_days`, `gemini_token`, `openai_token`, `createdAt`) VALUES
(1, 'Silver', '399', 0, 0, 0, 0, 0, 0, '30', '9999', '8888', '2024-07-22 09:58:29'),
(2, 'Gold', '499', 1, 1, 1, 1, 1, 1, '60', '99999', '88888', '2024-07-22 10:40:51'),
(3, 'Titile', '123', 0, 0, 0, 0, 0, 0, '13', '123', '132', '2024-07-22 12:07:09');

-- --------------------------------------------------------

--
-- Table structure for table `smtp`
--

CREATE TABLE `smtp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(999) DEFAULT NULL,
  `host` varchar(999) DEFAULT NULL,
  `port` varchar(999) DEFAULT NULL,
  `password` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `smtp`
--

INSERT INTO `smtp` (`id`, `email`, `host`, `port`, `password`, `createdAt`) VALUES
(1, 'email', 'host', '123', 'pass', '2024-08-08 15:22:39');

-- --------------------------------------------------------

--
-- Table structure for table `testimonial`
--

CREATE TABLE `testimonial` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(999) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `reviewer_name` varchar(999) DEFAULT NULL,
  `reviewer_position` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `testimonial`
--

INSERT INTO `testimonial` (`id`, `title`, `description`, `reviewer_name`, `reviewer_position`, `createdAt`) VALUES
(2, 'Stunning Visuals in Seconds', '\"Dallham\'s text-to-image generator has completely transformed our creative process. We can now visualize concepts instantly, bringing our ideas to life with stunning accuracy and detail. The quality and creativity it offers are unmatched.\"', 'Sarah Mitchell', 'Creative Director, Visionary Studios', '2024-08-12 13:47:30'),
(3, 'Effortless Video Creation', '\"The AI video maker from Dallham has been a game-changer for our content strategy. It simplifies the entire video production process, allowing us to create professional-quality videos in minutes. It\'s intuitive, powerful, and saves us a ton of time.\"', 'James Carter', 'Head of Content, MediaWorks', '2024-08-12 13:47:50'),
(4, 'Natural and Engaging Audio', '\"Dallham\'s text-to-speech technology delivers incredibly natural-sounding voices that have elevated our customer interactions. The range of voices and languages available is impressive, making it easy for us to connect with a global audience.\"', 'Emily Rodriguez', 'Customer Experience Manager, GlobalTech', '2024-08-12 13:48:04');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(999) DEFAULT 'user',
  `uid` varchar(999) DEFAULT NULL,
  `name` varchar(999) DEFAULT NULL,
  `email` varchar(999) DEFAULT NULL,
  `password` varchar(999) DEFAULT NULL,
  `mobile` varchar(999) DEFAULT NULL,
  `timezone` varchar(999) DEFAULT 'UTC',
  `plan` longtext DEFAULT NULL,
  `plan_expire` varchar(999) DEFAULT NULL,
  `trial` int(1) DEFAULT 0,
  `api_key` varchar(999) DEFAULT NULL,
  `gemini_token` varchar(999) DEFAULT '0',
  `openai_token` varchar(999) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `role`, `uid`, `name`, `email`, `password`, `mobile`, `timezone`, `plan`, `plan_expire`, `trial`, `api_key`, `gemini_token`, `openai_token`, `createdAt`) VALUES
(3, 'user', 'a6FjyLE4Oa5QSfILhT27TlHteEpEezMz', 'User', 'user@user.com', '$2b$10$Xz.jM/CsrfVaasY6xWvGqOPPMdY7Kag.by3mXVHOzgCvPDMN7S.Bq', '166672665', 'Asia/Kolkata', '{\"id\":2,\"name\":\"Gold\",\"price\":\"499\",\"in_app_chat\":1,\"image_maker\":1,\"code_writer\":1,\"speech_to_text\":1,\"voice_maker\":1,\"ai_video\":1,\"validity_days\":\"60\",\"gemini_token\":\"99999\",\"openai_token\":\"88888\",\"createdAt\":\"2024-07-22T05:10:51.000Z\"}', '1722413624408', 0, NULL, '99157', '76904', '2024-07-23 13:57:04');

-- --------------------------------------------------------

--
-- Table structure for table `web_private`
--

CREATE TABLE `web_private` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pay_offline_id` varchar(999) DEFAULT NULL,
  `pay_offline_key` varchar(999) DEFAULT NULL,
  `offline_active` varchar(999) DEFAULT NULL,
  `pay_stripe_id` varchar(999) DEFAULT NULL,
  `pay_stripe_key` varchar(999) DEFAULT NULL,
  `stripe_active` varchar(999) DEFAULT NULL,
  `pay_paystack_id` varchar(999) DEFAULT NULL,
  `pay_paystack_key` varchar(999) DEFAULT NULL,
  `paystack_active` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `web_private`
--

INSERT INTO `web_private` (`id`, `pay_offline_id`, `pay_offline_key`, `offline_active`, `pay_stripe_id`, `pay_stripe_key`, `stripe_active`, `pay_paystack_id`, `pay_paystack_key`, `paystack_active`, `createdAt`) VALUES
(1, 'Pay offline', 'Pay offline on this account number xxxxxxxxx\nand send a screenshot to us on this email xxx@xxx.com', '1', 'pk_test_51NGI3WSJ7RHyuQ0ARpYwHAK6WJYygcXmJTwwcVZsvusgQUSDMybxIpwtxxxxxxxxxxxxxxxxxxx', 'sk_test_51NGI3WSJ7RHyuQ0AG7eC7wD7kJrpTFKCnNaj3IwIIUVbJcPxE33YonYSyjJxxxxxxxxxxxxxxxxxxxxxxx', '1', 'pk_test_51NGI3WSJ7RHyuQ0ARpYwHAK6WJYygcXmJTwwcVZsvusgQUSDMybxIpwtxxxxxxxxxxxxxxxxxxx', 'sk_test_51NGI3WSJ7RHyuQ0AG7eC7wD7kJrpTFKCnNaj3IwIIUVbJcPxE33YonYSyjJxxxxxxxxxxxxxxxxxxxxxxx', '1', '2024-08-08 10:22:56');

-- --------------------------------------------------------

--
-- Table structure for table `web_public`
--

CREATE TABLE `web_public` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `currency_code` varchar(999) DEFAULT NULL,
  `logo` varchar(999) DEFAULT NULL,
  `app_name` varchar(999) DEFAULT NULL,
  `custom_home` varchar(999) DEFAULT NULL,
  `is_custom_home` int(1) DEFAULT 0,
  `meta_description` longtext DEFAULT NULL,
  `currency_symbol` varchar(999) DEFAULT NULL,
  `home_page_tutorial` varchar(999) DEFAULT NULL,
  `login_header_footer` int(1) DEFAULT 0,
  `exchange_rate` varchar(999) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `web_public`
--

INSERT INTO `web_public` (`id`, `currency_code`, `logo`, `app_name`, `custom_home`, `is_custom_home`, `meta_description`, `currency_symbol`, `home_page_tutorial`, `login_header_footer`, `exchange_rate`, `createdAt`) VALUES
(1, '$', 'CSpy1ro4plbtXktwHDCcW5XThERPJ9Gk.png', 'DallHAM', 'https://google.com', 0, 'seo des', '$', 'null', 0, '29', '2024-08-08 15:11:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ai_image`
--
ALTER TABLE `ai_image`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ai_model`
--
ALTER TABLE `ai_model`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ai_speech`
--
ALTER TABLE `ai_speech`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ai_video`
--
ALTER TABLE `ai_video`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ai_voice`
--
ALTER TABLE `ai_voice`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat`
--
ALTER TABLE `chat`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_form`
--
ALTER TABLE `contact_form`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `embed_chatbot`
--
ALTER TABLE `embed_chatbot`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `embed_chats`
--
ALTER TABLE `embed_chats`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `faq`
--
ALTER TABLE `faq`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `page`
--
ALTER TABLE `page`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plan`
--
ALTER TABLE `plan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `smtp`
--
ALTER TABLE `smtp`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `testimonial`
--
ALTER TABLE `testimonial`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `web_private`
--
ALTER TABLE `web_private`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `web_public`
--
ALTER TABLE `web_public`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ai_image`
--
ALTER TABLE `ai_image`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `ai_model`
--
ALTER TABLE `ai_model`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `ai_speech`
--
ALTER TABLE `ai_speech`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `ai_video`
--
ALTER TABLE `ai_video`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `ai_voice`
--
ALTER TABLE `ai_voice`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `api_keys`
--
ALTER TABLE `api_keys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `chat`
--
ALTER TABLE `chat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `contact_form`
--
ALTER TABLE `contact_form`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `embed_chatbot`
--
ALTER TABLE `embed_chatbot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `embed_chats`
--
ALTER TABLE `embed_chats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `faq`
--
ALTER TABLE `faq`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `page`
--
ALTER TABLE `page`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `plan`
--
ALTER TABLE `plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `smtp`
--
ALTER TABLE `smtp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `testimonial`
--
ALTER TABLE `testimonial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `web_private`
--
ALTER TABLE `web_private`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `web_public`
--
ALTER TABLE `web_public`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
