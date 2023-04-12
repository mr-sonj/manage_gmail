# Giải pháp quản lý tài khoản Gmail hàng loạt
Nếu bạn đang có một danh sách tài khoản Gmail mà không biết làm sao để kiểm tra những tài khoản đó có bị yêu cầu xác nhận số điện thoại hay không? hoặc bạn đang muốn đổi mật khẩu và địa chỉ email khôi phục hàng loạt thì đây chính là công cụ mà bạn đang cần. 

## I. Làm thế nào để cài đặt?
Đây là một extension chạy trên nên tảng trình duyệt của Chrome hoặc Edge nên bắt buộc bạn phải cài đặt sẳn 1 trong 2 trình duyệt trên. Vì quá trình chạy extension sẽ xóa toàn bộ cookie của trình duyệt nên bạn cần tạo một profile riêng cho extension này. Tránh ảnh hướng đến những tài khoản hay dữ liệu bạn đang sử dụng.

Sau khi chuẩn bị những điều trên, tiếp theo bạn hãy tải extension tại đường dẫn này: [extension_manage_gmail_1.0.0.rar](https://github.com/mr-sonj/manage_gmail/blob/master/extension_manage_gmail_1.0.0.rar) Và xem video ngắn hướng dẫn cài đặt extension không qua webstore của Chrome  [tại đây](https://www.youtube.com/shorts/ZislRGJZ2Dc)

## II. Tính năng cơ bản của Manage Gmail.
![giao diện manage gmail](https://sonjj.com/content/images/2023/04/Capture-1.JPG)

Bốn dấu tick ở giao diện extension tương tự với 4 tính năng phía dưới. Khi bạn tick vào tính năng nào, extension sẽ làm nhiệm vụ đó hoặc sẽ làm tất cả nếu bạn tick tất cả. Nhiệm vụ của extension sẽ lấy từng tài khoản Gmail một và làm hết các tính năng mà bạn chọn trước khi chuyển qua làm việc với tài khoản Gmail tiếp theo. 

1. Kiểm tra verify phone hoặc disable (không bắt buộc)
2. Đăng nhập hàng loạt ( không bắt buộc )
3. Đổi mật khẩu hàng loạt ( yêu cầu tick vào đăng nhập)
4. Đổi email khôi phục hàng loạt (yêu cầu tick vào đăng nhập)

## III. Hướng dẫn sử dụng Manage Gmail.
![Capture-3](https://sonjj.com/content/images/2023/04/Capture-3.JPG)
1. Khu vực 1: Để chạy được extension đầu tiên bạn có một tài khoản [Airtable](https://airtable.com/invite/r/IwhUVU4F). Airtable đơn giản là một công cụ lưu trữ giống excel mà thôi. Extension sẽ liên kết với Airtable thông qua API key và lấy từng Gmail một của bạn ở trong Airtable để thực hiện các tính nắng ở mục II. Vì vậy nếu chưa có tài khoản Airtable bạn cần phải [đăng ký ngay](https://airtable.com/invite/r/IwhUVU4F) (điều này là cần thiết). Sau khi đăng ký xong bạn hãy xem [video ngắn này](https://www.youtube.com/shorts/JGSi7_EMzJw) để lấy API key.
2. Khu vực 2: Đây là khu vực tính năng kiểm tra địa chỉ Gmail có bị verify phone hay bị disable mà không cần đăng nhập. Để sử dụng được tính năng này bạn cần mua API tại trang web này [https://ychecker.com](https://ychecker.com). Bạn có thể bỏ qua nếu không muốn sử dụng.
3. Khu vực 3: Khu vực tính năng đổi địa chỉ email khôi phục, cách sử dụng đơn giản nhất bạn **bỏ trống**. Extension sẽ tự tạo cho bạn một địa chỉ email ngẩu nhiên từ hệ thống địa chỉ email tạm thời [Smailpro.com](https://smailpro.com). Nếu không muốn sử dụng địa chỉ email tạm thời bạn có thể nhập địa chỉ email cụ thể mà bạn muốn (ví dụ: abc@example.com) hoặc nếu nhập domain (ví dụ: example.com) thì extension sẽ thay domain domain của địa chỉ email khôi phục hiện tại (ví dụ: acb@test.com sẽ thành abc@example.com). Nếu địa chỉ email khôi phục hiện tại không có thì extension sẽ tự động lấy username của gmail + với tên miền bạn nhập vào ( ví dụ: achdsh2727@gmail.com -> achdsh2727@example.com ).
4. Khu vực 4: Khu vực tính năng đổi mật khẩu, vẫn cách sử dụng đơn giản nhất là tick vào rồi bỏ trống trường query, extension sẽ tự động random mật khẩu. Bạn cũng có thể nhập mật khẩu cụ thể mà bạn muốn thay đổi (ví dụ: hsd78232u). Hoặc nâng cao hơn là thêm vào vài ký tự ở mật khẩu hiện tại (ví dụ: mật khẩu hiện tại là : 123456  mà bạn nhập là +acb, mật khẩu mới của bạn là: 123456acb). 

Khi đã có được API key và đã hiểu các khu vực của công cụ trên, tiếp theo bạn cần liên kết API key với extension và chuẩn bị một danh sách tài khoản Gmail để extension làm việc. Xem video tiếp theo để hiểu rõ được cách tùy chỉnh công cụ trước khi chạy: [https://www.youtube.com/shorts/2mUmEQbJ8D8](https://www.youtube.com/shorts/2mUmEQbJ8D8) . Còn đây là video demo khi công cụ chạy: [https://www.youtube.com/shorts/Ul8uau2NQN8](https://www.youtube.com/shorts/Ul8uau2NQN8). Trong video demo này những bước làm việc mình đã x3 tốc độ.

## IV. Những chú ý khi sử dụng.
1. ![Capture-4](https://sonjj.com/content/images/2023/04/Capture-4.JPG) Extension sẽ lấy chạy những địa Gmail nào có 2 cột note và status này bằng rỗng như hình. Đồng nghĩa nếu bạn không muốn chạy địa chỉ gmail nào thì cứ nhập bất cứ cái gì vào mục note hoặc chọn status ở Airtable. 
2. Phần loop ở extension đơn giản là phần nhập số lần muốn chạy.
3. Mỗi địa chỉ IP bạn không nên chạy quá 50 tài khoản Gmail, vì extension hiện không hỗ trợ thay đổi ip hay useragent. Cách đổi ip mình thường dùng là reset modem.
4. Về bảo mật thì extension không lấy bất cứ một thông tin nào của các bạn, đây là toàn bộ source code mà mình đã viết: [https://github.com/mr-sonj/manage_gmail](https://github.com/mr-sonj/manage_gmail) các bạn có thể kiểm tra và sử dụng code nếu muốn. Nếu có lòng thì giữ nguyên giúp mình phần copyright, cám ơn.
5. Đây là extension mình sử dụng hằng ngày nếu sẽ còn cập nhật dài dài. Hy vọng nó sẽ giúp ích cho nhiều người.
