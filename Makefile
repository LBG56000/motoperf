clear: 
	sudo docker compose down \

start:
	sudo docker compose up \

clear-all:
	sudo docker compose down -v \

get-dump:
	docker exec -it mongo mongodump \
	--db mydatabase \
	--out /dump \

run-seed:
	sudo docker exec -it backend npm run seed

build:
	sudo docker compose up --build -d
	sudo docker compose run --rm backend npm run seed