USE holland_career_test;

-- R: Realistic (10 câu hỏi, order 1-10)
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích làm việc với máy móc, công cụ hoặc thiết bị kỹ thuật.', 'R', 1),
('Tôi thích các hoạt động ngoài trời và làm việc với cây cối, động vật.', 'R', 2),
('Tôi có khả năng sửa chữa đồ điện, máy móc hoặc thiết bị trong nhà.', 'R', 3),
('Tôi thích làm việc với các vật thể cụ thể hơn là ý tưởng trừu tượng.', 'R', 4),
('Tôi thích công việc đòi hỏi kỹ năng vận động và khéo léo tay chân.', 'R', 5),
('Tôi thích xây dựng hoặc lắp ráp mọi thứ theo bản vẽ hoặc hướng dẫn.', 'R', 6),
('Tôi thích làm việc trong môi trường rõ ràng, có quy trình cụ thể.', 'R', 7),
('Tôi thích vận hành máy móc, thiết bị hơn là làm việc với con người.', 'R', 8),
('Tôi thích các công việc thực tế, tạo ra sản phẩm hữu hình.', 'R', 9),
('Tôi có xu hướng giải quyết vấn đề bằng cách hành động thực tế.', 'R', 10);

-- I: Investigative (10 câu hỏi, order 11-20)
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích tìm hiểu nguyên nhân và cách thức hoạt động của sự vật.', 'I', 11),
('Tôi thích giải các bài toán, câu đố hoặc vấn đề logic phức tạp.', 'I', 12),
('Tôi thích đọc sách khoa học và tìm hiểu các lý thuyết mới.', 'I', 13),
('Tôi thích làm thí nghiệm hoặc nghiên cứu để kiểm chứng giả thuyết.', 'I', 14),
('Tôi có khả năng phân tích dữ liệu và rút ra kết luận logic.', 'I', 15),
('Tôi thích làm việc độc lập để suy nghĩ và nghiên cứu chuyên sâu.', 'I', 16),
('Tôi tò mò về thế giới tự nhiên và các hiện tượng khoa học.', 'I', 17),
('Tôi thích sử dụng máy tính để phân tích và xử lý thông tin.', 'I', 18),
('Tôi thích khám phá những ý tưởng mới, ngay cả khi chúng trừu tượng.', 'I', 19),
('Tôi có xu hướng suy nghĩ logic và hệ thống khi giải quyết vấn đề.', 'I', 20);

-- A: Artistic (10 câu hỏi, order 21-30)
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích sáng tạo nghệ thuật như vẽ, viết, âm nhạc hoặc thiết kế.', 'A', 21),
('Tôi thích thể hiện bản thân qua các hình thức nghệ thuật.', 'A', 22),
('Tôi có trí tưởng tượng phong phú và thường nghĩ ra ý tưởng mới.', 'A', 23),
('Tôi thích làm việc trong môi trường tự do, không gò bó.', 'A', 24),
('Tôi đánh giá cao cái đẹp và thẩm mỹ trong cuộc sống.', 'A', 25),
('Tôi thích tạo ra những thứ độc đáo, không theo khuôn mẫu.', 'A', 26),
('Tôi thích viết lách, sáng tác truyện hoặc làm thơ.', 'A', 27),
('Tôi thích thiết kế đồ họa, thời trang hoặc nội thất.', 'A', 28),
('Tôi cảm thấy thoải mái khi được tự do sáng tạo không giới hạn.', 'A', 29),
('Tôi thích khám phá các hình thức nghệ thuật và văn hóa mới.', 'A', 30);

-- S: Social (10 câu hỏi, order 31-40)
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích giúp đỡ người khác giải quyết vấn đề cá nhân của họ.', 'S', 31),
('Tôi thích dạy học, hướng dẫn hoặc đào tạo người khác.', 'S', 32),
('Tôi thích làm việc nhóm và hợp tác với mọi người.', 'S', 33),
('Tôi có khả năng lắng nghe và thấu hiểu cảm xúc của người khác.', 'S', 34),
('Tôi thích tham gia các hoạt động tình nguyện và công tác xã hội.', 'S', 35),
('Tôi thích chăm sóc và hỗ trợ người khác khi họ gặp khó khăn.', 'S', 36),
('Tôi thích giao tiếp và kết nối với nhiều người khác nhau.', 'S', 37),
('Tôi thích làm việc trong môi trường đề cao sự hợp tác và chia sẻ.', 'S', 38),
('Tôi có khả năng hòa giải mâu thuẫn và tạo sự đồng thuận trong nhóm.', 'S', 39),
('Tôi cảm thấy hài lòng khi giúp đỡ người khác phát triển và thành công.', 'S', 40);

-- E: Enterprising (10 câu hỏi, order 41-50)
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích lãnh đạo nhóm và đưa ra quyết định quan trọng.', 'E', 41),
('Tôi thích thuyết phục người khác và đàm phán để đạt được mục tiêu.', 'E', 42),
('Tôi thích kinh doanh và tạo ra các dự án mới.', 'E', 43),
('Tôi có tham vọng và đặt mục tiêu cao trong sự nghiệp.', 'E', 44),
('Tôi thích cạnh tranh và chinh phục thử thách.', 'E', 45),
('Tôi có khả năng nói trước đám đông và trình bày ý tưởng.', 'E', 46),
('Tôi thích quản lý dự án và điều phối nguồn lực.', 'E', 47),
('Tôi thích chấp nhận rủi ro có tính toán để đạt được thành công.', 'E', 48),
('Tôi thích xây dựng mạng lưới quan hệ và kết nối kinh doanh.', 'E', 49),
('Tôi có xu hướng chủ động nắm bắt cơ hội và tạo ra thay đổi.', 'E', 50);

-- C: Conventional (10 câu hỏi, order 51-60)
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích làm việc với dữ liệu, con số và thông tin chi tiết.', 'C', 51),
('Tôi thích tổ chức, sắp xếp và phân loại thông tin một cách hệ thống.', 'C', 52),
('Tôi thích làm việc theo quy trình, quy định rõ ràng.', 'C', 53),
('Tôi có tính cẩn thận, tỉ mỉ và chú ý đến chi tiết.', 'C', 54),
('Tôi thích công việc ổn định, có cấu trúc và dự đoán được.', 'C', 55),
('Tôi thích lưu trữ hồ sơ, quản lý tài liệu và dữ liệu.', 'C', 56),
('Tôi thích làm việc với các biểu mẫu, bảng tính và cơ sở dữ liệu.', 'C', 57),
('Tôi có khả năng hoàn thành công việc đúng hạn và chính xác.', 'C', 58),
('Tôi thích tuân thủ các tiêu chuẩn và quy tắc đã được thiết lập.', 'C', 59),
('Tôi có xu hướng lập kế hoạch chi tiết trước khi hành động.', 'C', 60);

-- Careers (30 careers mapped to Holland codes)
INSERT INTO careers (holland_code, career_name, major_group, description, required_skills, learning_suggestion) VALUES
('RIA', 'Kỹ sư cơ khí', 'Kỹ thuật - Công nghệ', 'Thiết kế, chế tạo và bảo trì hệ thống cơ khí.', 'Tư duy kỹ thuật, giải quyết vấn đề, CAD/CAM', 'Đại học ngành Kỹ thuật Cơ khí, Cơ điện tử.'),
('RIS', 'Kỹ thuật viên phòng thí nghiệm', 'Khoa học - Kỹ thuật', 'Vận hành thiết bị thí nghiệm, phân tích mẫu, ghi chép kết quả.', 'Tỉ mỉ, chính xác, kỹ năng phân tích', 'Cao đẳng/Đại học ngành Kỹ thuật Hóa, Sinh, hoặc Xét nghiệm.'),
('RIE', 'Kỹ sư điện', 'Kỹ thuật - Công nghệ', 'Thiết kế và vận hành hệ thống điện, mạch điện tử.', 'Phân tích mạch, lập trình nhúng, an toàn điện', 'Đại học ngành Kỹ thuật Điện, Điện tử.'),
('RCA', 'Thợ thủ công mỹ nghệ', 'Nghệ thuật - Thủ công', 'Chế tác sản phẩm thủ công từ gỗ, gốm, kim loại.', 'Khéo tay, thẩm mỹ, kiên nhẫn', 'Học nghề, Cao đẳng Mỹ thuật Công nghiệp.'),
('REC', 'Quản lý sản xuất', 'Quản lý - Kỹ thuật', 'Điều phối quy trình sản xuất, đảm bảo chất lượng và tiến độ.', 'Lập kế hoạch, quản lý nhân sự, hiểu biết kỹ thuật', 'Đại học Quản lý Công nghiệp, Kỹ thuật Hệ thống Công nghiệp.'),
('IAR', 'Nhà nghiên cứu sinh học', 'Khoa học Tự nhiên', 'Nghiên cứu sinh vật sống, hệ sinh thái và quá trình sinh học.', 'Phương pháp nghiên cứu, phân tích dữ liệu, kiên trì', 'Đại học và sau đại học ngành Sinh học, Công nghệ Sinh học.'),
('IRS', 'Bác sĩ đa khoa', 'Y tế - Sức khỏe', 'Chẩn đoán và điều trị bệnh, chăm sóc sức khỏe cộng đồng.', 'Chẩn đoán, giao tiếp, ra quyết định', 'Đại học Y khoa (6 năm) + thực hành lâm sàng.'),
('IAC', 'Phân tích viên dữ liệu', 'CNTT - Dữ liệu', 'Thu thập, xử lý và phân tích dữ liệu để đưa ra insight kinh doanh.', 'SQL, Python/R, thống kê, trực quan hóa dữ liệu', 'Đại học ngành Khoa học Dữ liệu, Thống kê, CNTT.'),
('ISE', 'Nhà tư vấn chiến lược', 'Kinh doanh - Tư vấn', 'Phân tích vấn đề kinh doanh và đề xuất giải pháp chiến lược.', 'Phân tích, giải quyết vấn đề, thuyết trình, Excel, PowerPoint', 'Đại học Kinh tế, Quản trị Kinh doanh, MBA.'),
('ICR', 'Nhà phân tích tài chính', 'Tài chính - Ngân hàng', 'Phân tích báo cáo tài chính, đánh giá đầu tư, dự báo xu hướng.', 'Phân tích định lượng, mô hình tài chính, CFA', 'Đại học Tài chính, Kế toán, Kinh tế.'),
('AIS', 'Thiết kế đồ họa', 'Nghệ thuật - Truyền thông', 'Sáng tạo hình ảnh, bố cục và thiết kế cho truyền thông.', 'Adobe Creative Suite, typography, sáng tạo, giao tiếp', 'Đại học/Cao đẳng Thiết kế Đồ họa, Mỹ thuật.'),
('ASE', 'Nhà biên kịch / Viết nội dung', 'Truyền thông - Báo chí', 'Sáng tạo nội dung cho phim, quảng cáo, truyền thông số.', 'Viết lách, kể chuyện, sáng tạo, nghiên cứu', 'Đại học Báo chí, Truyền thông, Văn học.'),
('AEC', 'Kiến trúc sư', 'Xây dựng - Kiến trúc', 'Thiết kế công trình, không gian sống và cảnh quan.', 'Thiết kế 3D, vẽ kỹ thuật, sáng tạo, toán học', 'Đại học Kiến trúc (5 năm).'),
('ARI', 'Nhà thiết kế thời trang', 'Nghệ thuật - Thời trang', 'Sáng tạo và thiết kế trang phục, phụ kiện thời trang.', 'Sáng tạo, kỹ thuật may, xu hướng thị trường', 'Đại học/Cao đẳng Thiết kế Thời trang.'),
('AIR', 'Giáo viên nghệ thuật', 'Giáo dục - Nghệ thuật', 'Giảng dạy và truyền cảm hứng nghệ thuật cho học sinh.', 'Sư phạm, sáng tạo, giao tiếp, kiên nhẫn', 'Đại học Sư phạm Mỹ thuật, Giáo dục Nghệ thuật.'),
('SAI', 'Nhà tâm lý học', 'Khoa học Xã hội', 'Nghiên cứu hành vi con người, tư vấn và trị liệu tâm lý.', 'Lắng nghe, phân tích, thấu cảm, đạo đức nghề nghiệp', 'Đại học và sau đại học Tâm lý học, Công tác Xã hội.'),
('SIR', 'Nhân viên y tế công cộng', 'Y tế - Sức khỏe', 'Tổ chức chương trình sức khỏe cộng đồng, phòng chống dịch bệnh.', 'Tổ chức, giao tiếp, kiến thức y tế, nghiên cứu', 'Đại học Y tế Công cộng, Điều dưỡng Cộng đồng.'),
('SEA', 'Tư vấn viên du học', 'Giáo dục - Tư vấn', 'Tư vấn lộ trình du học, hồ sơ, chọn trường và ngành học.', 'Giao tiếp, tổ chức, kiến thức giáo dục quốc tế, ngoại ngữ', 'Đại học Quan hệ Quốc tế, Giáo dục, Ngoại ngữ.'),
('SCE', 'Nhân sự (HR)', 'Quản trị - Nhân sự', 'Tuyển dụng, đào tạo và phát triển nguồn nhân lực cho tổ chức.', 'Giao tiếp, tổ chức, am hiểu luật lao động, Excel', 'Đại học Quản trị Nhân lực, Kinh tế Lao động.'),
('SAC', 'Giáo viên tiểu học', 'Giáo dục - Sư phạm', 'Giảng dạy và phát triển toàn diện cho trẻ em bậc tiểu học.', 'Sư phạm, kiên nhẫn, sáng tạo, giao tiếp', 'Đại học Sư phạm Tiểu học, Giáo dục Tiểu học.'),
('ESR', 'Giám đốc kinh doanh', 'Kinh doanh - Quản lý', 'Xây dựng chiến lược và điều hành hoạt động kinh doanh của doanh nghiệp.', 'Lãnh đạo, chiến lược, tài chính, đàm phán', 'Đại học Quản trị Kinh doanh, MBA.'),
('EIA', 'Trưởng phòng Marketing', 'Marketing - Truyền thông', 'Xây dựng chiến lược marketing và quản lý đội ngũ thực thi.', 'Sáng tạo, phân tích thị trường, lãnh đạo, digital marketing', 'Đại học Marketing, Quản trị Kinh doanh, Truyền thông.'),
('ERC', 'Bất động sản viên', 'Kinh doanh - Bất động sản', 'Môi giới, tư vấn mua bán và cho thuê bất động sản.', 'Giao tiếp, đàm phán, kiến thức thị trường, mạng lưới', 'Chứng chỉ hành nghề, Đại học Kinh tế, Quản trị Kinh doanh.'),
('EAS', 'Tổ chức sự kiện', 'Dịch vụ - Sự kiện', 'Lên kế hoạch và điều phối tổ chức sự kiện, hội nghị, tiệc.', 'Tổ chức, sáng tạo, quản lý ngân sách, giao tiếp', 'Đại học Quản trị Sự kiện, Du lịch.'),
('ECI', 'Chuyên viên ngân hàng', 'Tài chính - Ngân hàng', 'Tư vấn và cung cấp dịch vụ tài chính, tín dụng cho khách hàng.', 'Phân tích tài chính, giao tiếp, chính xác, tin học văn phòng', 'Đại học Tài chính Ngân hàng, Kinh tế.'),
('CEI', 'Kế toán viên', 'Tài chính - Kế toán', 'Ghi chép, phân tích và báo cáo tài chính cho doanh nghiệp.', 'Tỉ mỉ, chính xác, Excel, phần mềm kế toán, luật thuế', 'Đại học Kế toán, Kiểm toán; chứng chỉ ACCA, CPA.'),
('CRS', 'Nhân viên hành chính văn phòng', 'Hành chính - Văn phòng', 'Quản lý hồ sơ, lịch làm việc và hỗ trợ hoạt động văn phòng.', 'Tổ chức, tin học văn phòng, giao tiếp, quản lý thời gian', 'Cao đẳng/Đại học Quản trị Văn phòng, Hành chính.'),
('CIR', 'Kiểm toán viên', 'Tài chính - Kiểm toán', 'Kiểm tra và xác nhận tính chính xác của báo cáo tài chính.', 'Phân tích, tỉ mỉ, kiến thức kế toán, đạo đức nghề nghiệp', 'Đại học Kiểm toán, Kế toán; chứng chỉ ACCA, CPA, CIA.'),
('CSE', 'Quản lý chất lượng', 'Sản xuất - Chất lượng', 'Thiết lập và giám sát hệ thống quản lý chất lượng sản phẩm.', 'ISO, quy trình, phân tích, báo cáo, giải quyết vấn đề', 'Đại học Quản lý Công nghiệp, Kỹ thuật Hệ thống, Chất lượng.'),
('CAE', 'Nhà lập kế hoạch tài chính', 'Tài chính - Kế hoạch', 'Tư vấn và lập kế hoạch tài chính cá nhân dài hạn cho khách hàng.', 'Phân tích, lập kế hoạch, kiến thức đầu tư, giao tiếp', 'Đại học Tài chính, Kinh tế; chứng chỉ CFP.'),
('SIA', 'Nhà nghiên cứu giáo dục', 'Giáo dục - Nghiên cứu', 'Nghiên cứu phương pháp giáo dục và phát triển chương trình học.', 'Nghiên cứu, phân tích, viết báo cáo, sư phạm', 'Sau đại học Giáo dục học, Nghiên cứu Giáo dục.');
