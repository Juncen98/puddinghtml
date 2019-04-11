package TestCollection;
import java.util.*;

public class MusicCollection 
{
/*	public static void main(String argv[])
	{
		MusicCollection m1 = new MusicCollection();
		System.out.println(m1.getAlbumsSize());
		System.exit(0);
	}*/

	private Album[] albums;
	
	public MusicCollection()
	{
		albums = new Album[2];
				
		Album a1 = new Album();
		a1.setTitle("Mr T1");
		a1.setArtist("Mr A1");
		a1.setYear("Y2K");
		albums[0] = a1;
		
		Album a2 = new Album();
		a2.setTitle("Mr T2");
		a2.setArtist("Mr A2");
		a2.setYear("Y2K2");
		albums[1] = a2;
		
	}
	
	public Album[] getAlbums()
	{
		return albums;	
	}
	
	public Album getAlbums(int index)
	{
		return albums[index];
	}
	
/*	public void setAlbums[double [] albums)
	{
	
	}*/
		
	public void setAlbums(int index,Album aAlbum)
	{
	}
	
	public int getAlbumsSize()
	{
		return albums.length;
	}
}





