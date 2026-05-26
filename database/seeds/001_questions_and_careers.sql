USE holland_career_test;

-- R: Realistic — Kỹ thuật, Thực tế (10 câu, order 1-10)
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích tự tay sửa chữa những đồ dùng hỏng trong nhà như quạt điện, ổ cắm, khóa cửa, xe đạp.', 'R', 1),
('Tôi thích các hoạt động ngoài trời như trồng rau, chăm sóc cây cảnh, nuôi cá hoặc vật nuôi.', 'R', 2),
('Tôi thích lắp ráp, tháo gỡ các thiết bị đơn giản như đồ chơi xếp hình, mô hình kỹ thuật, máy tính cũ.', 'R', 3),
('Tôi thích các môn học thực hành như Công nghệ, Kỹ thuật hơn là những môn lý thuyết trừu tượng.', 'R', 4),
('Tôi thích làm việc với các dụng cụ cầm tay như búa, kìm, tua vít, máy khoan cầm tay.', 'R', 5),
('Tôi có khả năng đọc hiểu sơ đồ, bản vẽ kỹ thuật hoặc hướng dẫn lắp ráp đồ đạc.', 'R', 6),
('Tôi thích những công việc tạo ra sản phẩm cụ thể, nhìn thấy kết quả rõ ràng sau khi làm.', 'R', 7),
('Tôi thích vận động chân tay, làm việc thực tế hơn là ngồi một chỗ xử lý giấy tờ, văn bản.', 'R', 8),
('Tôi thích tìm hiểu nguyên lý hoạt động của động cơ, máy móc như xe máy, máy bơm nước, máy phát điện.', 'R', 9),
('Tôi tham gia tích cực các giờ thực hành ở phòng thí nghiệm hoặc xưởng thực tập của trường.', 'R', 10);

-- I: Investigative — Nghiên cứu, Phân tích (10 câu, order 11-20)
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích tìm hiểu nguyên nhân của các hiện tượng tự nhiên như bão lụt, dịch bệnh, biến đổi khí hậu ở Việt Nam.', 'I', 11),
('Tôi thích giải các bài toán khó, câu đố logic hoặc các đề thi học sinh giỏi.', 'I', 12),
('Tôi thích đọc sách, xem video về khoa học, công nghệ mới, các phát minh và khám phá gần đây.', 'I', 13),
('Tôi thích tự mình làm thí nghiệm nhỏ để kiểm chứng một điều thắc mắc thay vì chỉ nghe giảng.', 'I', 14),
('Tôi có khả năng nhìn ra quy luật, mối liên hệ giữa các số liệu hoặc thông tin tưởng như rời rạc.', 'I', 15),
('Tôi thích tự học, tự nghiên cứu sâu một chủ đề mình đam mê ngoài giờ học trên lớp.', 'I', 16),
('Tôi tò mò về cách cơ thể con người hoạt động, nguyên lý của thuốc chữa bệnh và các tiến bộ y học.', 'I', 17),
('Tôi thích dùng máy tính để tra cứu thông tin, phân tích số liệu hoặc học lập trình.', 'I', 18),
('Tôi có thói quen đặt câu hỏi "tại sao" và "như thế nào" về mọi thứ xung quanh.', 'I', 19),
('Tôi thích suy nghĩ có hệ thống, phân tích vấn đề theo từng bước logic trước khi đưa ra kết luận.', 'I', 20);

-- A: Artistic — Nghệ thuật, Sáng tạo (10 câu, order 21-30)
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích vẽ tranh, chụp ảnh nghệ thuật hoặc thiết kế hình ảnh trên máy tính.', 'A', 21),
('Tôi thích viết nhật ký, truyện ngắn, làm thơ hoặc sáng tạo nội dung cho blog, mạng xã hội.', 'A', 22),
('Tôi có trí tưởng tượng phong phú và thường nghĩ ra những ý tưởng khác biệt so với mọi người.', 'A', 23),
('Tôi thích được tự do sáng tạo theo cách riêng thay vì bắt buộc làm theo khuôn mẫu có sẵn.', 'A', 24),
('Tôi thích nghe nhạc, chơi một loại nhạc cụ hoặc tự sáng tác giai điệu, lời bài hát.', 'A', 25),
('Tôi thích thiết kế, trang trí lại góc học tập, căn phòng của mình cho đẹp và độc đáo hơn.', 'A', 26),
('Tôi thích tìm hiểu về văn hóa nghệ thuật truyền thống Việt Nam như tranh Đông Hồ, ca trù, chèo, cải lương.', 'A', 27),
('Tôi thích thể hiện cá tính qua cách ăn mặc, kiểu tóc hoặc phong cách riêng của mình.', 'A', 28),
('Tôi thích khám phá các xu hướng thiết kế, thời trang, kiến trúc hoặc nghệ thuật đương đại.', 'A', 29),
('Tôi hào hứng tham gia các hoạt động văn nghệ của trường như vẽ tranh, diễn kịch, thi hát.', 'A', 30);

-- S: Social — Xã hội, Hỗ trợ (10 câu, order 31-40)
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi sẵn sàng giúp đỡ bạn bè, người thân khi họ gặp khó khăn trong học tập hoặc cuộc sống.', 'S', 31),
('Tôi thích dạy kèm, hướng dẫn các em nhỏ hoặc bạn học yếu hơn hiểu bài.', 'S', 32),
('Tôi thích làm việc nhóm, cùng mọi người hợp tác để hoàn thành nhiệm vụ chung.', 'S', 33),
('Tôi dễ dàng nhận ra tâm trạng buồn, vui, lo lắng của người khác và biết cách động viên họ.', 'S', 34),
('Tôi muốn tham gia các hoạt động tình nguyện như Mùa hè xanh, hiến máu nhân đạo, giúp đỡ vùng khó khăn.', 'S', 35),
('Tôi thích chăm sóc người thân khi ốm đau hoặc phụ giúp việc nhà để bố mẹ đỡ vất vả.', 'S', 36),
('Tôi thích trò chuyện, lắng nghe câu chuyện và tìm hiểu về cuộc sống của những người xung quanh.', 'S', 37),
('Tôi thích làm việc trong môi trường mọi người quan tâm, chia sẻ và hỗ trợ lẫn nhau.', 'S', 38),
('Tôi có khả năng hòa giải khi các bạn trong lớp hoặc nhóm có mâu thuẫn, bất đồng.', 'S', 39),
('Tôi cảm thấy công việc có ý nghĩa khi nó mang lại lợi ích và niềm vui cho người khác.', 'S', 40);

-- E: Enterprising — Quản lý, Kinh doanh (10 câu, order 41-50)
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích đứng ra tổ chức, dẫn dắt nhóm làm bài tập dự án hoặc hoạt động tập thể của lớp.', 'E', 41),
('Tôi thích thuyết trình, tranh biện hoặc trình bày ý kiến của mình trước tập thể lớp.', 'E', 42),
('Tôi thích tìm hiểu về kinh doanh, khởi nghiệp và mơ ước một ngày mở cửa hàng hoặc doanh nghiệp riêng.', 'E', 43),
('Tôi có tham vọng đạt được vị trí cao và được mọi người công nhận năng lực trong công việc tương lai.', 'E', 44),
('Tôi thích đặt mục tiêu cao và nỗ lực vượt qua thử thách để đạt thành tích tốt hơn.', 'E', 45),
('Tôi có khả năng thuyết phục bạn bè, người thân đồng tình với ý tưởng hoặc kế hoạch của mình.', 'E', 46),
('Tôi thích quản lý quỹ lớp, lập kế hoạch chi tiêu cho các hoạt động tập thể hoặc dự án nhóm.', 'E', 47),
('Tôi thích tìm kiếm cơ hội kiếm thêm thu nhập từ những công việc nhỏ phù hợp với lứa tuổi.', 'E', 48),
('Tôi thích gặp gỡ, giao lưu và xây dựng các mối quan hệ rộng rãi với nhiều người.', 'E', 49),
('Tôi có xu hướng chủ động đề xuất ý tưởng và bắt tay vào làm thay vì chờ đợi sự phân công.', 'E', 50);

-- C: Conventional — Quy củ, Tổ chức (10 câu, order 51-60)
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích sắp xếp sách vở, tài liệu, đồ dùng cá nhân gọn gàng, ngăn nắp theo trật tự nhất định.', 'C', 51),
('Tôi thích làm việc với các con số, bảng biểu và dữ liệu chi tiết như điểm số, thống kê.', 'C', 52),
('Tôi thích làm mọi việc theo đúng quy trình, hướng dẫn từng bước thay vì làm theo cảm hứng.', 'C', 53),
('Tôi là người cẩn thận, luôn kiểm tra lại bài làm, giấy tờ trước khi nộp hoặc bàn giao.', 'C', 54),
('Tôi thích công việc ổn định, có kế hoạch rõ ràng hơn là những thay đổi liên tục, khó đoán.', 'C', 55),
('Tôi thích lập danh sách những việc cần làm, ghi chú thời hạn và theo dõi tiến độ hoàn thành.', 'C', 56),
('Tôi thích sử dụng Excel, Google Sheets hoặc các phần mềm quản lý để tổ chức thông tin.', 'C', 57),
('Tôi có thói quen hoàn thành bài tập và công việc được giao đúng thời hạn, đúng yêu cầu.', 'C', 58),
('Tôi thích làm việc ở nơi có nội quy rõ ràng và mọi người cùng tuân thủ quy định chung.', 'C', 59),
('Tôi thích lập kế hoạch chi tiết cho việc học tập, chi tiêu cá nhân và các dự định tương lai.', 'C', 60);

-- Careers (30 ngành nghề gợi ý theo mã Holland)
INSERT INTO careers (holland_code, career_name, major_group, description, required_skills, learning_suggestion) VALUES
('RIA', 'Kỹ sư cơ khí', 'Kỹ thuật - Công nghệ', 'Thiết kế, chế tạo và bảo trì hệ thống cơ khí cho nhà máy và dây chuyền sản xuất.', 'Tư duy kỹ thuật, giải quyết vấn đề, CAD/CAM', 'Đại học ngành Kỹ thuật Cơ khí, Cơ điện tử.'),
('RIS', 'Kỹ thuật viên phòng thí nghiệm', 'Khoa học - Kỹ thuật', 'Vận hành thiết bị thí nghiệm, phân tích mẫu, ghi chép kết quả chính xác.', 'Tỉ mỉ, chính xác, kỹ năng phân tích', 'Cao đẳng/Đại học ngành Kỹ thuật Hóa, Sinh, hoặc Xét nghiệm.'),
('RIE', 'Kỹ sư điện - điện tử', 'Kỹ thuật - Công nghệ', 'Thiết kế và vận hành hệ thống điện, mạch điện tử, thiết bị tự động hóa.', 'Phân tích mạch, lập trình nhúng, an toàn điện', 'Đại học ngành Kỹ thuật Điện, Điện tử, Tự động hóa.'),
('RCA', 'Thợ thủ công mỹ nghệ', 'Nghệ thuật - Thủ công', 'Chế tác sản phẩm thủ công từ gỗ, gốm, mây tre đan hoặc kim loại.', 'Khéo tay, thẩm mỹ, kiên nhẫn, tỉ mỉ', 'Học nghề tại làng nghề, Cao đẳng Mỹ thuật Công nghiệp.'),
('REC', 'Quản lý sản xuất', 'Quản lý - Kỹ thuật', 'Điều phối quy trình sản xuất, đảm bảo chất lượng sản phẩm và tiến độ giao hàng.', 'Lập kế hoạch, quản lý nhân sự, hiểu biết kỹ thuật', 'Đại học Quản lý Công nghiệp, Kỹ thuật Hệ thống Công nghiệp.'),
('IAR', 'Nhà nghiên cứu sinh học', 'Khoa học Tự nhiên', 'Nghiên cứu sinh vật sống, hệ sinh thái và ứng dụng công nghệ sinh học vào nông nghiệp, y tế.', 'Phương pháp nghiên cứu, phân tích dữ liệu, kiên trì', 'Đại học và sau đại học ngành Sinh học, Công nghệ Sinh học.'),
('IRS', 'Bác sĩ đa khoa', 'Y tế - Sức khỏe', 'Chẩn đoán và điều trị bệnh, chăm sóc sức khỏe ban đầu cho người dân.', 'Chẩn đoán, giao tiếp với bệnh nhân, ra quyết định', 'Đại học Y khoa (6 năm) + thực hành lâm sàng.'),
('IAC', 'Chuyên viên phân tích dữ liệu', 'CNTT - Dữ liệu', 'Thu thập, xử lý và phân tích dữ liệu để đưa ra thông tin hỗ trợ quyết định kinh doanh.', 'SQL, Python/R, thống kê, trực quan hóa dữ liệu', 'Đại học ngành Khoa học Dữ liệu, Thống kê, CNTT.'),
('ISE', 'Chuyên viên tư vấn chiến lược', 'Kinh doanh - Tư vấn', 'Phân tích vấn đề kinh doanh và đề xuất giải pháp chiến lược cho doanh nghiệp.', 'Phân tích, giải quyết vấn đề, thuyết trình, Excel, PowerPoint', 'Đại học Kinh tế, Quản trị Kinh doanh, MBA.'),
('ICR', 'Chuyên viên phân tích tài chính', 'Tài chính - Ngân hàng', 'Phân tích báo cáo tài chính, đánh giá cơ hội đầu tư và dự báo xu hướng thị trường.', 'Phân tích định lượng, mô hình tài chính, CFA', 'Đại học Tài chính, Kế toán, Kinh tế.'),
('AIS', 'Thiết kế đồ họa', 'Nghệ thuật - Truyền thông', 'Sáng tạo hình ảnh, bố cục và thiết kế cho quảng cáo, truyền thông số và ấn phẩm.', 'Adobe Creative Suite, typography, sáng tạo, giao tiếp', 'Đại học/Cao đẳng Thiết kế Đồ họa, Mỹ thuật Công nghiệp.'),
('ASE', 'Nhà sáng tạo nội dung', 'Truyền thông - Báo chí', 'Sáng tạo nội dung cho mạng xã hội, video, quảng cáo và các nền tảng truyền thông số.', 'Viết lách, kể chuyện, quay dựng video, sáng tạo', 'Đại học Báo chí, Truyền thông Đa phương tiện, Marketing.'),
('AEC', 'Kiến trúc sư', 'Xây dựng - Kiến trúc', 'Thiết kế công trình xây dựng, không gian sống và quy hoạch cảnh quan đô thị.', 'Thiết kế 3D, vẽ kỹ thuật, sáng tạo, toán học', 'Đại học Kiến trúc (5 năm).'),
('ARI', 'Nhà thiết kế thời trang', 'Nghệ thuật - Thời trang', 'Sáng tạo và thiết kế trang phục, phụ kiện thời trang cho thị trường trong nước và xuất khẩu.', 'Sáng tạo, kỹ thuật may, nắm bắt xu hướng', 'Đại học/Cao đẳng Thiết kế Thời trang, Công nghệ May.'),
('AIR', 'Giáo viên mỹ thuật', 'Giáo dục - Nghệ thuật', 'Giảng dạy và truyền cảm hứng nghệ thuật cho học sinh các cấp.', 'Sư phạm, sáng tạo, giao tiếp, kiên nhẫn', 'Đại học Sư phạm Mỹ thuật, Giáo dục Nghệ thuật.'),
('SAI', 'Chuyên viên tâm lý học đường', 'Khoa học Xã hội', 'Tư vấn tâm lý, hỗ trợ cảm xúc và định hướng cho học sinh, sinh viên.', 'Lắng nghe, thấu cảm, phân tích, đạo đức nghề nghiệp', 'Đại học và sau đại học Tâm lý học, Tâm lý Giáo dục.'),
('SIR', 'Nhân viên y tế dự phòng', 'Y tế - Sức khỏe', 'Tổ chức chương trình sức khỏe cộng đồng, tiêm chủng và phòng chống dịch bệnh tại địa phương.', 'Tổ chức, giao tiếp, kiến thức y tế công cộng', 'Đại học Y tế Công cộng, Điều dưỡng Cộng đồng.'),
('SEA', 'Tư vấn viên du học', 'Giáo dục - Tư vấn', 'Tư vấn lộ trình du học, chuẩn bị hồ sơ, chọn trường và ngành học phù hợp.', 'Giao tiếp, tổ chức, kiến thức giáo dục quốc tế, ngoại ngữ', 'Đại học Quan hệ Quốc tế, Giáo dục, Ngôn ngữ Anh.'),
('SCE', 'Chuyên viên nhân sự (HR)', 'Quản trị - Nhân sự', 'Tuyển dụng, đào tạo và phát triển nguồn nhân lực cho doanh nghiệp.', 'Giao tiếp, tổ chức, am hiểu luật lao động, Excel', 'Đại học Quản trị Nhân lực, Kinh tế Lao động.'),
('SAC', 'Giáo viên tiểu học', 'Giáo dục - Sư phạm', 'Giảng dạy, chăm sóc và phát triển toàn diện cho trẻ em bậc tiểu học.', 'Sư phạm, kiên nhẫn, sáng tạo, giao tiếp với trẻ', 'Đại học Sư phạm Tiểu học, Giáo dục Tiểu học.'),
('ESR', 'Giám đốc điều hành', 'Kinh doanh - Quản lý', 'Xây dựng chiến lược và điều hành hoạt động kinh doanh tổng thể của doanh nghiệp.', 'Lãnh đạo, chiến lược, tài chính, đàm phán', 'Đại học Quản trị Kinh doanh, MBA.'),
('EIA', 'Trưởng phòng Marketing', 'Marketing - Truyền thông', 'Xây dựng chiến lược marketing, quản lý thương hiệu và đội ngũ thực thi.', 'Sáng tạo, phân tích thị trường, lãnh đạo, digital marketing', 'Đại học Marketing, Quản trị Kinh doanh, Truyền thông.'),
('ERC', 'Chuyên viên môi giới bất động sản', 'Kinh doanh - Bất động sản', 'Tư vấn mua bán, cho thuê bất động sản và hỗ trợ thủ tục pháp lý cho khách hàng.', 'Giao tiếp, đàm phán, kiến thức thị trường, mạng lưới quan hệ', 'Chứng chỉ hành nghề, Đại học Kinh tế, Luật Kinh tế.'),
('EAS', 'Chuyên viên tổ chức sự kiện', 'Dịch vụ - Sự kiện', 'Lên kế hoạch và điều phối tổ chức sự kiện, hội nghị, hội thảo, tiệc cưới.', 'Tổ chức, sáng tạo, quản lý ngân sách, giao tiếp', 'Đại học Quản trị Sự kiện, Du lịch, Quan hệ Công chúng.'),
('ECI', 'Giao dịch viên ngân hàng', 'Tài chính - Ngân hàng', 'Tư vấn và cung cấp dịch vụ tài chính, tín dụng, tiết kiệm cho khách hàng cá nhân và doanh nghiệp.', 'Giao tiếp, chính xác, tin học văn phòng, kiến thức tài chính', 'Đại học Tài chính Ngân hàng, Kinh tế, Quản trị Kinh doanh.'),
('CEI', 'Kế toán viên', 'Tài chính - Kế toán', 'Ghi chép, phân tích và lập báo cáo tài chính, quyết toán thuế cho doanh nghiệp.', 'Tỉ mỉ, chính xác, Excel, phần mềm kế toán, luật thuế', 'Đại học Kế toán, Kiểm toán; chứng chỉ ACCA, CPA Việt Nam.'),
('CRS', 'Nhân viên hành chính văn phòng', 'Hành chính - Văn phòng', 'Quản lý hồ sơ, công văn, lịch làm việc và hỗ trợ hoạt động hàng ngày của cơ quan.', 'Tổ chức, tin học văn phòng, giao tiếp, quản lý thời gian', 'Cao đẳng/Đại học Quản trị Văn phòng, Hành chính.'),
('CIR', 'Kiểm toán viên', 'Tài chính - Kiểm toán', 'Kiểm tra, xác nhận tính chính xác và trung thực của báo cáo tài chính doanh nghiệp.', 'Phân tích, tỉ mỉ, kiến thức kế toán, đạo đức nghề nghiệp', 'Đại học Kiểm toán, Kế toán; chứng chỉ CPA, ACCA, CIA.'),
('CSE', 'Chuyên viên quản lý chất lượng', 'Sản xuất - Chất lượng', 'Thiết lập và giám sát hệ thống quản lý chất lượng, đảm bảo sản phẩm đạt tiêu chuẩn.', 'ISO, quy trình, phân tích, báo cáo, giải quyết vấn đề', 'Đại học Quản lý Công nghiệp, Kỹ thuật Hệ thống, Chất lượng.'),
('CAE', 'Chuyên viên hoạch định tài chính cá nhân', 'Tài chính - Tư vấn', 'Tư vấn và lập kế hoạch tài chính dài hạn, tiết kiệm và đầu tư cho khách hàng cá nhân.', 'Phân tích, lập kế hoạch, kiến thức đầu tư, giao tiếp', 'Đại học Tài chính, Kinh tế; chứng chỉ CFP, Hoạch định Tài chính.'),
('SIA', 'Nghiên cứu viên giáo dục', 'Giáo dục - Nghiên cứu', 'Nghiên cứu phương pháp giảng dạy, phát triển chương trình học và đánh giá chất lượng giáo dục.', 'Nghiên cứu, phân tích, viết báo cáo, kiến thức sư phạm', 'Sau đại học Giáo dục học, Nghiên cứu Giáo dục, Quản lý Giáo dục.');
