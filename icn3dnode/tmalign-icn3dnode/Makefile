CC = g++

CFLAGS = -O3 -ffast-math -g3 -fmessage-length=0 -std=c++11 
#CFLAGS = -O3 -ffast-math -g3 -fmessage-length=0 -std=c++0x 

TARGET = tmalign-icn3dnode

$(TARGET): resi2igstrand.o igstrand2kabat.o igstrand2imgt.o TMalign.o tmalignCgi.o
	$(CC) $(CFLAGS) -o $(TARGET) resi2igstrand.o igstrand2kabat.o igstrand2imgt.o TMalign.o tmalignCgi.o

resi2igstrand.o: resi2igstrand.cpp
	$(CC) $(CFLAGS) -c resi2igstrand.cpp

igstrand2kabat.o: igstrand2kabat.cpp
	$(CC) $(CFLAGS) -c igstrand2kabat.cpp

igstrand2imgt.o: igstrand2imgt.cpp
	$(CC) $(CFLAGS) -c igstrand2imgt.cpp

TMalign.o: TMalign.cpp
	$(CC) $(CFLAGS) -c TMalign.cpp

tmalignCgi.o: tmalignCgi.cpp
	$(CC) $(CFLAGS) -c tmalignCgi.cpp

clean:
	rm -f tmalign *.o
	