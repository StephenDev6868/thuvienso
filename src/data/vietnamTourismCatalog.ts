export type TourismCategory =
  'Biểu tượng' | 'Biển đảo' | 'Sinh thái' | 'Di tích' | 'Bảo tàng' | 'Di sản'

export interface TourismSpotSeed {
  name: string
  category: TourismCategory
  description: string
  imageQuery: string
}

const spot = (
  name: string,
  category: TourismCategory,
  description: string,
  imageQuery = `${name} Vietnam`,
): TourismSpotSeed => ({ name, category, description, imageQuery })

export const vietnamTourismCatalog: Record<string, TourismSpotSeed[]> = {
  'ha-noi': [
    spot(
      'Hoàng thành Thăng Long',
      'Di sản',
      'Trung tâm quyền lực lâu đời của kinh thành Thăng Long, được UNESCO ghi danh Di sản thế giới.',
    ),
    spot(
      'Văn Miếu - Quốc Tử Giám',
      'Di tích',
      'Quần thể thờ Khổng Tử và trường đại học đầu tiên của Việt Nam.',
    ),
    spot(
      'Hồ Hoàn Kiếm',
      'Biểu tượng',
      'Không gian lịch sử giữa trung tâm Thủ đô, gắn với tháp Rùa và đền Ngọc Sơn.',
    ),
    spot(
      'Lăng Chủ tịch Hồ Chí Minh',
      'Di tích',
      'Công trình tại Quảng trường Ba Đình, nơi lưu giữ dấu ấn lịch sử hiện đại của đất nước.',
    ),
    spot(
      'Làng cổ Đường Lâm',
      'Di sản',
      'Làng Việt cổ nổi bật với nhà đá ong, đình làng và cảnh quan nông thôn Bắc Bộ.',
    ),
  ],
  hue: [
    spot(
      'Đại Nội Huế',
      'Di sản',
      'Kinh thành và Hoàng thành của triều Nguyễn, hạt nhân của Quần thể Di tích Cố đô Huế.',
    ),
    spot(
      'Lăng Minh Mạng',
      'Di tích',
      'Lăng vua Nguyễn có bố cục cân xứng giữa kiến trúc cung đình và cảnh quan đồi núi.',
    ),
    spot(
      'Chùa Thiên Mụ',
      'Di tích',
      'Ngôi chùa cổ bên sông Hương với tháp Phước Duyên là biểu tượng quen thuộc của Huế.',
    ),
    spot(
      'Đầm phá Tam Giang - Cầu Hai',
      'Sinh thái',
      'Hệ đầm phá ven biển rộng lớn, giàu sinh cảnh và văn hóa đánh bắt thủy sản.',
    ),
    spot(
      'Vịnh Lăng Cô',
      'Biển đảo',
      'Vịnh biển nằm giữa đèo Hải Vân và đầm Lập An, có bãi cát dài và núi bao quanh.',
    ),
  ],
  'hai-phong': [
    spot(
      'Quần đảo Cát Bà',
      'Di sản',
      'Quần đảo đá vôi và rừng trên biển thuộc Di sản thiên nhiên thế giới Vịnh Hạ Long - Cát Bà.',
    ),
    spot(
      'Bãi biển Đồ Sơn',
      'Biển đảo',
      'Khu nghỉ mát ven biển lâu đời của thành phố cảng Hải Phòng.',
    ),
    spot(
      'Khu di tích Côn Sơn - Kiếp Bạc',
      'Di tích',
      'Quần thể gắn với Trần Hưng Đạo, Nguyễn Trãi và lịch sử vùng xứ Đông.',
    ),
    spot(
      'Văn miếu Mao Điền',
      'Di tích',
      'Văn miếu lớn của vùng Hải Dương, tôn vinh truyền thống khoa bảng và hiếu học.',
    ),
    spot(
      'Nhà hát thành phố Hải Phòng',
      'Biểu tượng',
      'Công trình kiến trúc đô thị đầu thế kỷ XX tại trung tâm thành phố cảng.',
    ),
  ],
  'ho-chi-minh': [
    spot(
      'Dinh Độc Lập',
      'Di tích',
      'Di tích quốc gia đặc biệt gắn với ngày đất nước thống nhất 30/4/1975.',
    ),
    spot(
      'Địa đạo Củ Chi',
      'Di tích',
      'Hệ thống đường hầm kháng chiến quy mô lớn ở vùng đất thép Củ Chi.',
    ),
    spot(
      'Bến Nhà Rồng',
      'Bảo tàng',
      'Nơi Nguyễn Tất Thành ra đi tìm đường cứu nước năm 1911, nay là bảo tàng lịch sử.',
    ),
    spot(
      'Bãi Sau Vũng Tàu',
      'Biển đảo',
      'Bãi biển đô thị dài, kết nối không gian du lịch biển phía đông nam thành phố.',
    ),
    spot(
      'Đặc khu Côn Đảo',
      'Di sản',
      'Quần đảo có hệ sinh thái biển, rừng quốc gia và hệ thống di tích nhà tù lịch sử.',
    ),
  ],
  'can-tho': [
    spot(
      'Chợ nổi Cái Răng',
      'Di sản',
      'Không gian giao thương trên sông tiêu biểu của văn hóa miền Tây Nam Bộ.',
    ),
    spot(
      'Bến Ninh Kiều',
      'Biểu tượng',
      'Bến sông bên dòng Hậu, điểm ngắm cảnh và sinh hoạt văn hóa của Cần Thơ.',
    ),
    spot(
      'Thiền viện Trúc Lâm Phương Nam',
      'Di tích',
      'Công trình Phật giáo mang kiến trúc truyền thống giữa vùng cây trái Phong Điền.',
    ),
    spot(
      'Chùa Dơi Sóc Trăng',
      'Di tích',
      'Ngôi chùa Khmer cổ nổi tiếng với quần thể dơi ngựa và kiến trúc Nam tông.',
    ),
    spot(
      'Khu bảo tồn Lung Ngọc Hoàng',
      'Sinh thái',
      'Vùng đất ngập nước quan trọng, bảo tồn hệ sinh thái tự nhiên của đồng bằng sông Cửu Long.',
    ),
  ],
  'tuyen-quang': [
    spot(
      'Cao nguyên đá Đồng Văn',
      'Di sản',
      'Công viên địa chất toàn cầu với địa hình karst và bản sắc các dân tộc vùng cao.',
    ),
    spot(
      'Cột cờ Lũng Cú',
      'Biểu tượng',
      'Cột cờ tại vùng cực Bắc, nhìn xuống thung lũng và các bản làng biên giới.',
    ),
    spot(
      'Khu di tích Tân Trào',
      'Di tích',
      'Thủ đô Khu giải phóng, nơi diễn ra nhiều sự kiện quan trọng trước Cách mạng Tháng Tám.',
    ),
    spot(
      'Hẻm Tu Sản - sông Nho Quế',
      'Sinh thái',
      'Hẻm vực sâu giữa núi đá, nổi bật với dòng Nho Quế xanh dưới đèo Mã Pì Lèng.',
    ),
    spot(
      'Hồ Na Hang',
      'Sinh thái',
      'Hồ lớn giữa núi rừng, thác và các bản dân tộc ở vùng thượng nguồn sông Gâm.',
    ),
  ],
  'cao-bang': [
    spot(
      'Thác Bản Giốc',
      'Sinh thái',
      'Thác nước lớn trên sông Quây Sơn giữa cảnh quan karst biên giới.',
    ),
    spot(
      'Khu di tích Pác Bó',
      'Di tích',
      'Nơi Chủ tịch Hồ Chí Minh sống và làm việc khi trở về Tổ quốc năm 1941.',
    ),
    spot(
      'Động Ngườm Ngao',
      'Sinh thái',
      'Hang động đá vôi dài với hệ thống nhũ đá phong phú gần thác Bản Giốc.',
    ),
    spot('Núi Mắt Thần', 'Sinh thái', 'Ngọn núi thủng độc đáo giữa thung lũng cỏ và hồ theo mùa.'),
    spot(
      'Làng đá Khuổi Ky',
      'Di sản',
      'Làng của người Tày với những ngôi nhà sàn xây bằng đá truyền thống.',
    ),
  ],
  'lai-chau': [
    spot(
      'Đèo Ô Quy Hồ',
      'Sinh thái',
      'Một trong những cung đèo cao, dài và hùng vĩ nhất vùng Tây Bắc.',
    ),
    spot(
      'Đỉnh Pu Ta Leng',
      'Sinh thái',
      'Đỉnh núi cao thuộc dãy Hoàng Liên Sơn, nổi tiếng với rừng nguyên sinh và hoa đỗ quyên.',
    ),
    spot(
      'Bản Sin Suối Hồ',
      'Di sản',
      'Bản du lịch cộng đồng của người Mông, gìn giữ cảnh quan và nếp sống bản địa.',
    ),
    spot(
      'Động Pu Sam Cáp',
      'Sinh thái',
      'Quần thể hang động đá vôi gần thành phố Lai Châu với nhiều nhũ đá tự nhiên.',
    ),
    spot(
      'Cao nguyên Sìn Hồ',
      'Sinh thái',
      'Vùng cao khí hậu mát, ruộng bậc thang và các phiên chợ dân tộc.',
    ),
  ],
  'lao-cai': [
    spot(
      'Sa Pa',
      'Biểu tượng',
      'Đô thị vùng cao dưới chân Hoàng Liên Sơn, nổi bật với khí hậu mát và văn hóa bản địa.',
    ),
    spot(
      'Đỉnh Fansipan',
      'Sinh thái',
      'Đỉnh cao nhất Việt Nam và bán đảo Đông Dương, thuộc dãy Hoàng Liên Sơn.',
    ),
    spot(
      'Ruộng bậc thang Mù Cang Chải',
      'Di sản',
      'Danh thắng ruộng bậc thang do cộng đồng người Mông kiến tạo qua nhiều thế hệ.',
    ),
    spot(
      'Đèo Khau Phạ',
      'Sinh thái',
      'Cung đèo cao nhìn xuống thung lũng Tú Lệ và ruộng bậc thang Tây Bắc.',
    ),
    spot(
      'Dinh Hoàng A Tưởng',
      'Di tích',
      'Dinh thự đầu thế kỷ XX pha trộn kiến trúc Á - Âu tại Bắc Hà.',
    ),
  ],
  'thai-nguyen': [
    spot('Hồ Ba Bể', 'Sinh thái', 'Hồ nước ngọt tự nhiên giữa vùng núi đá vôi và rừng quốc gia.'),
    spot(
      'ATK Định Hóa',
      'Di tích',
      'Căn cứ an toàn khu của Trung ương trong thời kỳ kháng chiến chống Pháp.',
    ),
    spot(
      'Đồi chè Tân Cương',
      'Di sản',
      'Vùng chè nổi tiếng với cảnh quan đồi thấp và nghề chế biến chè truyền thống.',
    ),
    spot(
      'Động Hua Mạ',
      'Sinh thái',
      'Hang động lớn trong vùng lõi cảnh quan Ba Bể, có nhiều cột và rèm đá.',
    ),
    spot(
      'Bảo tàng Văn hóa các dân tộc Việt Nam',
      'Bảo tàng',
      'Không gian trưng bày di sản vật thể và phi vật thể của cộng đồng các dân tộc Việt Nam.',
    ),
  ],
  'dien-bien': [
    spot('Đồi A1', 'Di tích', 'Cứ điểm quan trọng trong Chiến dịch Điện Biên Phủ năm 1954.'),
    spot(
      'Hầm Đờ Cát',
      'Di tích',
      'Sở chỉ huy tập đoàn cứ điểm Pháp, nơi ghi dấu thời khắc kết thúc chiến dịch.',
    ),
    spot(
      'Bảo tàng Chiến thắng Điện Biên Phủ',
      'Bảo tàng',
      'Trưng bày hiện vật và bức tranh panorama về chiến dịch lịch sử.',
    ),
    spot(
      'Cánh đồng Mường Thanh',
      'Di sản',
      'Cánh đồng lớn trong lòng chảo Điện Biên, gắn với đời sống người Thái.',
    ),
    spot(
      'A Pa Chải',
      'Biểu tượng',
      'Khu vực cực Tây đất liền Việt Nam, nơi tiếp giáp biên giới Việt Nam - Lào - Trung Quốc.',
    ),
  ],
  'lang-son': [
    spot(
      'Động Tam Thanh',
      'Sinh thái',
      'Hang động và chùa cổ nằm trong quần thể danh thắng Nhị - Tam Thanh.',
    ),
    spot(
      'Ải Chi Lăng',
      'Di tích',
      'Cửa ải lịch sử gắn với nhiều chiến thắng chống ngoại xâm của dân tộc.',
    ),
    spot(
      'Núi Tô Thị',
      'Di tích',
      'Danh thắng gắn với hình tượng nàng Tô Thị trong văn hóa dân gian.',
    ),
    spot(
      'Thung lũng Bắc Sơn',
      'Sinh thái',
      'Thung lũng karst với ruộng lúa và các bản làng nhìn từ đỉnh Nà Lay.',
    ),
    spot(
      'Đền Kỳ Cùng',
      'Di tích',
      'Ngôi đền cổ bên sông Kỳ Cùng, trung tâm tín ngưỡng của xứ Lạng.',
    ),
  ],
  'son-la': [
    spot(
      'Cao nguyên Mộc Châu',
      'Sinh thái',
      'Cao nguyên có đồi chè, đồng cỏ và mùa hoa mận, hoa cải đặc trưng.',
    ),
    spot(
      'Nhà tù Sơn La',
      'Di tích',
      'Di tích nơi thực dân Pháp giam giữ nhiều chiến sĩ cách mạng.',
    ),
    spot(
      'Cầu kính Bạch Long',
      'Biểu tượng',
      'Công trình cầu kính đi bộ bắc qua thung lũng ở Mộc Châu.',
    ),
    spot('Tà Xùa', 'Sinh thái', 'Vùng núi cao nổi tiếng với sống lưng khủng long và biển mây.'),
    spot(
      'Lòng hồ sông Đà',
      'Sinh thái',
      'Không gian sông nước và bản làng hình thành quanh hồ thủy điện Sơn La.',
    ),
  ],
  'phu-tho': [
    spot(
      'Khu di tích Đền Hùng',
      'Di tích',
      'Không gian thờ các Vua Hùng trên núi Nghĩa Lĩnh, biểu tượng cội nguồn dân tộc.',
    ),
    spot(
      'Vườn quốc gia Xuân Sơn',
      'Sinh thái',
      'Khu rừng núi đá vôi có hang động và bản làng dân tộc Dao, Mường.',
    ),
    spot(
      'Tam Đảo',
      'Sinh thái',
      'Thị trấn nghỉ dưỡng trên dãy Tam Đảo với khí hậu mát và cảnh quan núi.',
    ),
    spot(
      'Thung lũng Mai Châu',
      'Di sản',
      'Thung lũng cư trú lâu đời của người Thái, nổi bật với nhà sàn và ruộng lúa.',
    ),
    spot(
      'Nhà máy thủy điện Hòa Bình',
      'Biểu tượng',
      'Công trình thủy điện lớn trên sông Đà, gắn với quá trình phát triển năng lượng quốc gia.',
    ),
  ],
  'bac-ninh': [
    spot(
      'Chùa Dâu',
      'Di tích',
      'Trung tâm Phật giáo cổ của vùng Luy Lâu, được xem là một trong những ngôi chùa lâu đời nhất Việt Nam.',
    ),
    spot(
      'Làng tranh Đông Hồ',
      'Di sản',
      'Làng nghề làm tranh dân gian bằng ván khắc và màu tự nhiên.',
    ),
    spot(
      'Chùa Vĩnh Nghiêm',
      'Di tích',
      'Chốn tổ Thiền phái Trúc Lâm, nơi lưu giữ kho mộc bản được UNESCO ghi danh.',
    ),
    spot(
      'Tây Yên Tử',
      'Sinh thái',
      'Không gian núi rừng và di tích theo con đường hoằng dương Phật pháp của Phật hoàng Trần Nhân Tông.',
    ),
    spot('Đền Đô', 'Di tích', 'Đền thờ tám vị vua triều Lý tại vùng đất Kinh Bắc.'),
  ],
  'quang-ninh': [
    spot(
      'Vịnh Hạ Long',
      'Di sản',
      'Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi trên mặt biển.',
    ),
    spot('Khu di tích Yên Tử', 'Di tích', 'Trung tâm Phật giáo Trúc Lâm trên dãy núi Yên Tử.'),
    spot('Đảo Cô Tô', 'Biển đảo', 'Quần đảo ngoài khơi có bãi biển, rừng và hệ sinh thái ven bờ.'),
    spot(
      'Bảo tàng Quảng Ninh',
      'Bảo tàng',
      'Công trình trưng bày lịch sử tự nhiên, văn hóa biển và ngành than vùng Đông Bắc.',
    ),
    spot(
      'Vịnh Bái Tử Long',
      'Biển đảo',
      'Không gian biển đảo tiếp nối Hạ Long, có cảnh quan karst và các làng ven biển.',
    ),
  ],
  'hung-yen': [
    spot(
      'Khu di tích Phố Hiến',
      'Di tích',
      'Dấu tích thương cảng quốc tế sầm uất của Đàng Ngoài từ thế kỷ XVI - XVII.',
    ),
    spot(
      'Chùa Keo Thái Bình',
      'Di tích',
      'Kiệt tác kiến trúc gỗ cổ nổi bật với gác chuông nhiều tầng.',
    ),
    spot(
      'Đền Trần Thái Bình',
      'Di tích',
      'Quần thể tưởng niệm nơi phát tích và dựng nghiệp của vương triều Trần.',
    ),
    spot(
      'Làng Nôm',
      'Di sản',
      'Làng cổ Bắc Bộ còn giữ cổng làng, cầu đá, chợ và nhiều nhà truyền thống.',
    ),
    spot(
      'Vườn nhãn lồng Hưng Yên',
      'Sinh thái',
      'Không gian canh tác giống nhãn đặc sản gắn với vùng phù sa sông Hồng.',
    ),
  ],
  'ninh-binh': [
    spot(
      'Quần thể danh thắng Tràng An',
      'Di sản',
      'Di sản hỗn hợp thế giới với núi đá vôi, hang xuyên thủy và di tích khảo cổ.',
    ),
    spot(
      'Cố đô Hoa Lư',
      'Di tích',
      'Kinh đô của nhà nước Đại Cồ Việt dưới các triều Đinh và Tiền Lê.',
    ),
    spot('Chùa Tam Chúc', 'Di tích', 'Quần thể Phật giáo bên hồ và núi đá vôi tại vùng Hà Nam cũ.'),
    spot(
      'Quần thể Phủ Dầy',
      'Di tích',
      'Trung tâm thực hành tín ngưỡng thờ Mẫu gắn với Thánh Mẫu Liễu Hạnh.',
    ),
    spot(
      'Nhà thờ Phát Diệm',
      'Di tích',
      'Quần thể kiến trúc Công giáo kết hợp nghệ thuật đình chùa truyền thống Việt Nam.',
    ),
  ],
  'thanh-hoa': [
    spot(
      'Thành nhà Hồ',
      'Di sản',
      'Tòa thành đá cuối thế kỷ XIV được UNESCO ghi danh Di sản văn hóa thế giới.',
    ),
    spot(
      'Khu di tích Lam Kinh',
      'Di tích',
      'Kinh thành và sơn lăng của vương triều Hậu Lê, gắn với khởi nghĩa Lam Sơn.',
    ),
    spot('Biển Sầm Sơn', 'Biển đảo', 'Bãi biển nghỉ dưỡng lâu đời bên dãy Trường Lệ.'),
    spot(
      'Suối cá Cẩm Lương',
      'Sinh thái',
      'Dòng suối tự nhiên có đàn cá tập trung dày đặc dưới chân núi đá vôi.',
    ),
    spot(
      'Khu bảo tồn Pù Luông',
      'Sinh thái',
      'Cảnh quan núi đá vôi, rừng và ruộng bậc thang của cộng đồng Thái, Mường.',
    ),
  ],
  'nghe-an': [
    spot(
      'Khu di tích Kim Liên',
      'Di tích',
      'Quê hương Chủ tịch Hồ Chí Minh với làng Sen và làng Hoàng Trù.',
    ),
    spot(
      'Vườn quốc gia Pù Mát',
      'Sinh thái',
      'Khu rừng đặc dụng trong Khu dự trữ sinh quyển miền Tây Nghệ An.',
    ),
    spot(
      'Biển Cửa Lò',
      'Biển đảo',
      'Bãi biển dài gần thành phố Vinh, nổi tiếng với cát mịn và đảo ven bờ.',
    ),
    spot('Đền Cuông', 'Di tích', 'Ngôi đền trên núi Mộ Dạ thờ An Dương Vương.'),
    spot(
      'Quảng trường Hồ Chí Minh',
      'Biểu tượng',
      'Không gian văn hóa lớn của thành phố Vinh với tượng đài Chủ tịch Hồ Chí Minh.',
    ),
  ],
  'ha-tinh': [
    spot(
      'Ngã ba Đồng Lộc',
      'Di tích',
      'Di tích quốc gia đặc biệt tưởng niệm lực lượng thanh niên xung phong trên tuyến Trường Sơn.',
    ),
    spot(
      'Khu lưu niệm Nguyễn Du',
      'Di tích',
      'Không gian tưởng niệm đại thi hào Nguyễn Du tại quê hương Tiên Điền.',
    ),
    spot(
      'Chùa Hương Tích',
      'Di tích',
      'Ngôi chùa cổ trên dãy Hồng Lĩnh, nhìn xuống đồng bằng ven biển.',
    ),
    spot('Biển Thiên Cầm', 'Biển đảo', 'Bãi biển hình cánh cung dưới chân núi Thiên Cầm.'),
    spot('Hồ Kẻ Gỗ', 'Sinh thái', 'Hồ nước lớn giữa rừng, gắn với khu bảo tồn thiên nhiên Kẻ Gỗ.'),
  ],
  'quang-tri': [
    spot(
      'Phong Nha - Kẻ Bàng',
      'Di sản',
      'Di sản thiên nhiên thế giới nổi bật với hệ thống karst và hang động quy mô lớn.',
    ),
    spot('Thành cổ Quảng Trị', 'Di tích', 'Di tích gắn với cuộc chiến đấu 81 ngày đêm năm 1972.'),
    spot(
      'Địa đạo Vịnh Mốc',
      'Di tích',
      'Làng hầm nhiều tầng trong lòng đất, nơi người dân sinh sống trong thời chiến.',
    ),
    spot(
      'Cầu Hiền Lương - sông Bến Hải',
      'Di tích',
      'Biểu tượng của thời kỳ đất nước tạm thời bị chia cắt và hành trình thống nhất.',
    ),
    spot(
      'Động Thiên Đường',
      'Sinh thái',
      'Hang động khô nổi bật với hệ thống thạch nhũ trong vùng Phong Nha - Kẻ Bàng.',
    ),
  ],
  'quang-ngai': [
    spot(
      'Đặc khu Lý Sơn',
      'Biển đảo',
      'Đảo núi lửa ngoài khơi với địa chất độc đáo và truyền thống đội Hoàng Sa.',
    ),
    spot(
      'Măng Đen',
      'Sinh thái',
      'Cao nguyên khí hậu mát, có rừng thông, hồ và thác tại vùng Kon Tum cũ.',
    ),
    spot(
      'Khu chứng tích Sơn Mỹ',
      'Di tích',
      'Không gian tưởng niệm các nạn nhân trong vụ thảm sát Sơn Mỹ năm 1968.',
    ),
    spot(
      'Nhà thờ gỗ Kon Tum',
      'Di tích',
      'Công trình kết hợp kiến trúc Roman với vật liệu gỗ và văn hóa Tây Nguyên.',
    ),
    spot('Gành Yến', 'Sinh thái', 'Bờ biển có cấu trúc đá núi lửa và rạn san hô gần bờ.'),
  ],
  'gia-lai': [
    spot(
      'Eo Gió Quy Nhơn',
      'Biển đảo',
      'Vịnh nhỏ giữa hai dãy núi đá, nổi bật với cung đường ven biển.',
    ),
    spot(
      'Bảo tàng Quang Trung',
      'Bảo tàng',
      'Không gian lưu giữ hiện vật về phong trào Tây Sơn và Hoàng đế Quang Trung.',
    ),
    spot(
      'Biển Hồ Tơ Nưng',
      'Sinh thái',
      'Hồ nước trong miệng núi lửa cổ, biểu tượng của phố núi Pleiku.',
    ),
    spot(
      'Núi lửa Chư Đăng Ya',
      'Sinh thái',
      'Núi lửa đã tắt với cảnh quan nương rẫy và mùa hoa dã quỳ.',
    ),
    spot(
      'Tháp Đôi Quy Nhơn',
      'Di tích',
      'Cụm tháp Chăm Pa thế kỷ XII nằm trong không gian đô thị Quy Nhơn.',
    ),
  ],
  'khanh-hoa': [
    spot(
      'Vịnh Nha Trang',
      'Biển đảo',
      'Vịnh biển có hệ thống đảo, bãi tắm và cảnh quan đô thị ven bờ.',
    ),
    spot(
      'Tháp Bà Ponagar',
      'Di tích',
      'Quần thể đền tháp Chăm Pa thờ nữ thần Ponagar bên sông Cái.',
    ),
    spot(
      'Vịnh Vĩnh Hy',
      'Biển đảo',
      'Vịnh nhỏ được bao bọc bởi núi đá và hệ sinh thái Vườn quốc gia Núi Chúa.',
    ),
    spot(
      'Vườn quốc gia Núi Chúa',
      'Sinh thái',
      'Khu dự trữ sinh quyển với hệ sinh thái rừng khô hạn và rạn san hô.',
    ),
    spot('Hang Rái', 'Sinh thái', 'Bờ đá ven biển có thềm san hô cổ và cảnh quan sóng độc đáo.'),
  ],
  'lam-dong': [
    spot(
      'Đà Lạt',
      'Biểu tượng',
      'Đô thị cao nguyên nổi tiếng với kiến trúc nghỉ dưỡng, rừng thông và khí hậu mát.',
    ),
    spot(
      'Công viên địa chất Đắk Nông',
      'Di sản',
      'Công viên địa chất toàn cầu có hệ thống hang động núi lửa và di sản bản địa.',
    ),
    spot('Đồi cát Mũi Né', 'Sinh thái', 'Cảnh quan cồn cát ven biển thay đổi hình dạng theo gió.'),
    spot('Hồ Tà Đùng', 'Sinh thái', 'Hồ trên cao nguyên với nhiều đảo nhỏ giữa vùng núi.'),
    spot(
      'Tháp Pô Sah Inư',
      'Di tích',
      'Cụm tháp Chăm cổ trên đồi Bà Nài nhìn ra vùng biển Phan Thiết.',
    ),
  ],
  'dak-lak': [
    spot(
      'Gành Đá Đĩa',
      'Di sản',
      'Danh thắng địa chất với các cột đá bazan xếp sát nhau bên bờ biển Phú Yên.',
    ),
    spot(
      'Bảo tàng Thế giới Cà phê',
      'Bảo tàng',
      'Không gian trưng bày văn hóa cà phê và kiến trúc lấy cảm hứng từ nhà dài Tây Nguyên.',
    ),
    spot(
      'Vườn quốc gia Yok Đôn',
      'Sinh thái',
      'Khu rừng khộp đặc trưng, bảo tồn đa dạng sinh học vùng Tây Nguyên.',
    ),
    spot(
      'Vịnh Vũng Rô',
      'Biển đảo',
      'Vịnh biển kín gió dưới chân đèo Cả, gắn với di tích tàu Không số.',
    ),
    spot(
      'Thác Dray Nur',
      'Sinh thái',
      'Thác lớn trên hệ thống sông Sêrêpốk giữa địa hình đá bazan.',
    ),
  ],
  'dong-nai': [
    spot(
      'Vườn quốc gia Cát Tiên',
      'Sinh thái',
      'Khu rừng nhiệt đới quan trọng, thuộc Khu dự trữ sinh quyển thế giới Đồng Nai.',
    ),
    spot(
      'Hồ Trị An',
      'Sinh thái',
      'Hồ nước lớn trên sông Đồng Nai với các đảo và làng nghề ven hồ.',
    ),
    spot(
      'Vườn quốc gia Bù Gia Mập',
      'Sinh thái',
      'Khu rừng đầu nguồn bảo tồn hệ sinh thái chuyển tiếp Đông Nam Bộ - Tây Nguyên.',
    ),
    spot('Sóc Bom Bo', 'Di sản', 'Địa danh gắn với văn hóa người S’tiêng và lịch sử kháng chiến.'),
    spot('Khu du lịch Bửu Long', 'Biểu tượng', 'Cảnh quan hồ và núi đá gần đô thị Biên Hòa.'),
  ],
  'tay-ninh': [
    spot(
      'Núi Bà Đen',
      'Sinh thái',
      'Ngọn núi cao nhất Nam Bộ, gắn với quần thể tâm linh và cảnh quan hồ Dầu Tiếng.',
    ),
    spot(
      'Tòa thánh Cao Đài',
      'Di tích',
      'Trung tâm của đạo Cao Đài với kiến trúc và nghi lễ đặc sắc.',
    ),
    spot(
      'Làng nổi Tân Lập',
      'Sinh thái',
      'Khu rừng tràm và đất ngập nước tiêu biểu của vùng Đồng Tháp Mười.',
    ),
    spot(
      'Khu bảo tồn Láng Sen',
      'Sinh thái',
      'Vùng đất ngập nước có hệ sinh thái đồng cỏ, kênh rạch và chim nước.',
    ),
    spot(
      'Căn cứ Trung ương Cục miền Nam',
      'Di tích',
      'Căn cứ lãnh đạo cách mạng miền Nam trong thời kỳ kháng chiến.',
    ),
  ],
  'dong-thap': [
    spot(
      'Vườn quốc gia Tràm Chim',
      'Sinh thái',
      'Khu Ramsar bảo tồn hệ sinh thái đất ngập nước và nhiều loài chim quý.',
    ),
    spot('Làng hoa Sa Đéc', 'Di sản', 'Làng nghề trồng hoa lâu đời bên sông Tiền.'),
    spot(
      'Cù lao Thới Sơn',
      'Sinh thái',
      'Cù lao miệt vườn trên sông Tiền với cây trái và sinh hoạt đờn ca tài tử.',
    ),
    spot(
      'Làng cổ Đông Hòa Hiệp',
      'Di sản',
      'Làng cổ ở Cái Bè còn giữ nhiều nhà truyền thống Nam Bộ.',
    ),
    spot(
      'Khu di tích Xẻo Quýt',
      'Di tích',
      'Căn cứ kháng chiến giữa rừng tràm và kênh rạch Đồng Tháp.',
    ),
  ],
  'vinh-long': [
    spot(
      'Lò gạch Mang Thít',
      'Di sản',
      'Không gian di sản công nghiệp gạch gốm dọc kênh Thầy Cai.',
    ),
    spot(
      'Cù lao An Bình',
      'Sinh thái',
      'Vùng cù lao cây trái và du lịch cộng đồng trên sông Tiền.',
    ),
    spot(
      'Cồn Phụng Bến Tre',
      'Sinh thái',
      'Cồn nổi giữa sông Tiền với vườn cây và nghề thủ công từ dừa.',
    ),
    spot(
      'Ao Bà Om',
      'Di tích',
      'Danh thắng gắn với chùa Âng và đời sống văn hóa Khmer ở Trà Vinh.',
    ),
    spot(
      'Chùa Vĩnh Tràng',
      'Di tích',
      'Ngôi chùa lớn kết hợp nhiều phong cách kiến trúc tại vùng Mỹ Tho.',
    ),
  ],
  'an-giang': [
    spot(
      'Đảo Phú Quốc',
      'Biển đảo',
      'Đảo lớn nhất Việt Nam với bãi biển, rừng quốc gia và hệ sinh thái biển.',
    ),
    spot(
      'Rừng tràm Trà Sư',
      'Sinh thái',
      'Rừng ngập nước theo mùa ở vùng Tịnh Biên, có hệ chim và thủy sinh phong phú.',
    ),
    spot(
      'Miếu Bà Chúa Xứ Núi Sam',
      'Di tích',
      'Trung tâm tín ngưỡng lớn gắn với lễ hội Vía Bà Chúa Xứ.',
    ),
    spot('Quần đảo Nam Du', 'Biển đảo', 'Cụm đảo ngoài khơi Kiên Giang với bãi biển và làng chài.'),
    spot(
      'Hà Tiên - Thạch Động',
      'Di tích',
      'Không gian văn hóa biên viễn với núi đá, hang động và dấu ấn họ Mạc.',
    ),
  ],
  'ca-mau': [
    spot(
      'Mũi Cà Mau',
      'Biểu tượng',
      'Điểm cực Nam trên đất liền, nơi có rừng ngập mặn hướng ra biển.',
    ),
    spot(
      'Vườn quốc gia U Minh Hạ',
      'Sinh thái',
      'Hệ sinh thái rừng tràm trên đất than bùn đặc trưng vùng Tây Nam Bộ.',
    ),
    spot(
      'Cánh đồng điện gió Bạc Liêu',
      'Biểu tượng',
      'Cụm tua-bin gió ven biển, hình ảnh đặc trưng của vùng Bạc Liêu.',
    ),
    spot(
      'Nhà Công tử Bạc Liêu',
      'Di tích',
      'Biệt thự cổ gắn với câu chuyện văn hóa đô thị Nam Bộ đầu thế kỷ XX.',
    ),
    spot(
      'Đầm Thị Tường',
      'Sinh thái',
      'Đầm nước tự nhiên rộng lớn với đời sống đánh bắt thủy sản của cư dân địa phương.',
    ),
  ],
  'hoang-sa': [
    spot(
      'Quần đảo Hoàng Sa',
      'Biển đảo',
      'Quần đảo của Việt Nam trên Biển Đông, có vị trí đặc biệt về lịch sử, địa lý và chủ quyền.',
      'Hoang Sa Paracel Islands Vietnam',
    ),
    spot(
      'Đảo Hoàng Sa',
      'Biển đảo',
      'Đảo thuộc nhóm Lưỡi Liềm của quần đảo Hoàng Sa, xuất hiện trong nhiều tư liệu hàng hải.',
      'Pattle Island Hoang Sa Vietnam',
    ),
    spot(
      'Đảo Phú Lâm',
      'Biển đảo',
      'Đảo thuộc nhóm An Vĩnh trong quần đảo Hoàng Sa của Việt Nam.',
      'Phu Lam Woody Island Hoang Sa',
    ),
    spot(
      'Nhà trưng bày Hoàng Sa',
      'Bảo tàng',
      'Không gian tại Đà Nẵng giới thiệu tư liệu và bằng chứng về chủ quyền của Việt Nam đối với Hoàng Sa.',
    ),
    spot(
      'Hải đội Hoàng Sa',
      'Di sản',
      'Di sản lịch sử về những đội dân binh từ miền Trung thực thi nhiệm vụ trên Hoàng Sa từ nhiều thế kỷ trước.',
      'Hoang Sa flotilla Ly Son monument',
    ),
  ],
  'truong-sa': [
    spot(
      'Đảo Trường Sa',
      'Biển đảo',
      'Đảo trung tâm của đặc khu Trường Sa, tỉnh Khánh Hòa.',
      'Truong Sa Lon Island Vietnam',
    ),
    spot(
      'Đảo Song Tử Tây',
      'Biển đảo',
      'Đảo ở phía bắc quần đảo Trường Sa, có công trình dân sinh và hải đăng.',
      'Song Tu Tay Island Vietnam',
    ),
    spot(
      'Đảo Sinh Tồn',
      'Biển đảo',
      'Đảo thuộc cụm Sinh Tồn với hệ sinh thái biển và các công trình phục vụ đời sống.',
      'Sinh Ton Island Vietnam',
    ),
    spot(
      'Chùa Trường Sa Lớn',
      'Di tích',
      'Không gian văn hóa tâm linh trên đảo Trường Sa, hướng về cội nguồn dân tộc.',
      'Truong Sa Lon pagoda Vietnam',
    ),
    spot(
      'Hải đăng Trường Sa',
      'Biểu tượng',
      'Công trình hàng hải hỗ trợ nhận biết luồng tuyến và khẳng định sự hiện diện hòa bình trên biển.',
      'Truong Sa lighthouse Vietnam',
    ),
  ],
}
