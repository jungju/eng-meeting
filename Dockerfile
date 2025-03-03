# 공식 Nginx 이미지를 기반으로 합니다.
FROM nginx:alpine

# 현재 디렉토리의 모든 파일을 Nginx 기본 웹 루트 디렉토리로 복사합니다.
COPY . /usr/share/nginx/html

# 컨테이너에서 사용할 포트 80을 노출합니다.
EXPOSE 80
